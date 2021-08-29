import { produce } from 'immer'
import {
  add,
  substract,
  increase,
  decrease,
  multiply,
  divide,
  modulo,
  and,
  or,
  xor,
  not,
  rol,
  ror,
  shl,
  shr
} from './operations'
import {
  InvalidRegisterError,
  RunBeyondEndOfMemory,
  StackOverflowError,
  StackUnderflowError,
  PortError
} from '../../common/exceptions'
import { Opcode, Register } from '../../common/constants'
import { Head, sign8, unsign8 } from '../../common/utils'

type GPR = [AL: number, BL: number, CL: number, DL: number]

const MAX_SP = 0xbf

enum Flag {
  Zero,
  Overflow,
  Sign,
  Interrupt
}

type SR = [zero: boolean, overflow: boolean, sign: boolean, interrupt: boolean]

export interface CPU {
  gpr: GPR
  ip: number
  sp: number
  sr: SR
  // TODO: isFault
  isHalted: boolean
}

export const init = (): CPU => {
  return {
    gpr: [0, 0, 0, 0],
    ip: 0,
    sp: MAX_SP,
    sr: [false, false, false, false],
    isHalted: false
  }
}

const checkGPR = (register: number): Register => {
  if (register < 0 || register > 3) {
    throw new InvalidRegisterError(register)
  }
  return register
}

const checkIP = (address: number): number => {
  if (address > 0xff) {
    throw new RunBeyondEndOfMemory()
  }
  return address
}

const checkSP = (address: number): number => {
  if (address < 0) {
    throw new StackOverflowError()
  }
  if (address > MAX_SP) {
    throw new StackUnderflowError()
  }
  return address
}

const getFlagsValue = (sr: SR): number =>
  sr.reduce((value, isSet, flag) => (isSet ? value + 0b10 ** (flag + 1) : value), 0)

const getFlagsFromValue = (value: number): SR => {
  const valueStr = value.toString(2).padStart(5, '0')
  return valueStr
    .slice(-5, -1)
    .split('')
    .map(val => val === '1')
    .reduceRight<boolean[]>((flags, isSet) => [...flags, isSet], []) as SR
}

const checkOperationResult = (
  result: number,
  previousValue: number
): [finalResult: number, flags: Head<SR>] => {
  const flags: Head<SR> = [/* zero */ false, /* overflow */ false, /* sign */ false]
  if ((previousValue < 0x80 && result >= 0x80) || (previousValue >= 0x80 && result < 0x80)) {
    flags[Flag.Overflow] = true
  }
  const finalResult = result > 0xff ? result % 0x100 : unsign8(result)
  if (finalResult === 0) {
    flags[Flag.Zero] = true
  } else if (finalResult >= 0x80) {
    flags[Flag.Sign] = true
  }
  return [finalResult, flags]
}

interface Signals {
  input?: number
  inputPort?: number
  outputPort?: number
  interrupt?: boolean
}

enum PortType {
  Input = 'input',
  Output = 'output'
}

const checkPort = (value: number): number => {
  if (value < 0 || value > 0x0f) {
    throw new PortError()
  }
  return value
}

type StepArgs = [memory: number[], cpu: CPU, signals?: Signals]
type StepResult = StepArgs

export const step = (...args: StepArgs): StepResult =>
  produce(args, draft => {
    const [memory, cpu, signals] = draft

    /* -------------------------------------------------------------------------- */
    /*                                    Init                                    */
    /* -------------------------------------------------------------------------- */

    const loadFromMemory = (address: number): number => {
      return memory[address]
    }
    const storeToMemory = (address: number, machineCode: number): void => {
      memory[address] = machineCode
    }

    const getGPR = (register: Register): number => cpu.gpr[register]
    const setGPR = (register: Register, value: number): void => {
      cpu.gpr[register] = value
    }

    const getIP = (): number => cpu.ip
    const getNextIP = (): number => getIP() + 1
    const setIP = (address: number): void => {
      cpu.ip = address
    }

    /**
     * @modifies {@link cpu.ip}
     */
    const incIP = (value = 1): number => {
      setIP(checkIP(getIP() + value))
      return getIP()
    }

    const getSP = (): number => cpu.sp
    const setSP = (address: number): void => {
      cpu.sp = address
    }
    const push = (value: number): void => {
      storeToMemory(getSP(), value)
      setSP(checkSP(getSP() - 1))
    }
    const pop = (): number => {
      setSP(checkSP(getSP() + 1))
      return loadFromMemory(getSP())
    }

    const getSR = (): SR => cpu.sr
    const isFlagSet = (flag: Flag): boolean => getSR()[flag]
    const setSR = (flags: Partial<SR>): void => {
      Object.assign(cpu.sr, flags)
    }

    /**
     * @modifies {@link cpu.sr}
     */
    const operate = <T extends [number] | [number, number]>(
      operation: (...operands: T) => number,
      ...operands: T
    ): number => {
      const [finalResult, flags] = checkOperationResult(
        operation(...operands),
        operands[operands.length - 1]
      )
      setSR(flags)
      return finalResult
    }

    const getInput = (): number | undefined => signals?.input
    const resetInput = (): void => {
      delete signals!.input
      if (Object.keys(signals!).length === 0) {
        draft.pop()
      }
    }
    const setPort = (type: PortType, port: number): void => {
      ;(draft[2] ?? (draft[2] = {}))[`${type}Port`] = port
    }

    /* -------------------------------------------------------------------------- */
    /*                                     Run                                    */
    /* -------------------------------------------------------------------------- */

    const opcode = loadFromMemory(getIP())

    switch (opcode) {
      case Opcode.END:
        // TODO setHalted()
        cpu.isHalted = true
        break

      // Direct Arithmetic
      case Opcode.ADD_REG_TO_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const srcReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, operate(add, getGPR(srcReg), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.SUB_REG_FROM_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const srcReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, operate(substract, getGPR(srcReg), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.MUL_REG_BY_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const srcReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, operate(multiply, getGPR(srcReg), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.DIV_REG_BY_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const srcReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, operate(divide, getGPR(srcReg), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.INC_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, operate(increase, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.DEC_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, operate(decrease, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.MOD_REG_BY_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const srcReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, operate(modulo, getGPR(srcReg), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.AND_REG_WITH_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const srcReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, operate(and, getGPR(srcReg), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.OR_REG_WITH_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const srcReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, operate(or, getGPR(srcReg), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.XOR_REG_WITH_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const srcReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, operate(xor, getGPR(srcReg), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.NOT_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, operate(not, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.ROL_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, operate(rol, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.ROR_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, operate(ror, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.SHL_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, operate(shl, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.SHR_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, operate(shr, getGPR(destReg)))
        incIP()
        break
      }

      // Immediate Arithmetic
      case Opcode.ADD_NUM_TO_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const value = loadFromMemory(incIP())
        setGPR(destReg, operate(add, value, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.SUB_NUM_FROM_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const value = loadFromMemory(incIP())
        setGPR(destReg, operate(substract, value, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.MUL_REG_BY_NUM: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const value = loadFromMemory(incIP())
        setGPR(destReg, operate(multiply, value, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.DIV_REG_BY_NUM: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const value = loadFromMemory(incIP())
        setGPR(destReg, operate(divide, value, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.MOD_REG_BY_NUM: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const value = loadFromMemory(incIP())
        setGPR(destReg, operate(modulo, value, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.AND_REG_WITH_NUM: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const value = loadFromMemory(incIP())
        setGPR(destReg, operate(and, value, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.OR_REG_WITH_NUM: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const value = loadFromMemory(incIP())
        setGPR(destReg, operate(or, value, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.XOR_REG_WITH_NUM: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const value = loadFromMemory(incIP())
        setGPR(destReg, operate(xor, value, getGPR(destReg)))
        incIP()
        break
      }

      // Jump
      case Opcode.JMP: {
        const distance = sign8(loadFromMemory(getNextIP()))
        incIP(distance)
        break
      }
      case Opcode.JZ: {
        const distance = sign8(loadFromMemory(getNextIP()))
        incIP(isFlagSet(Flag.Zero) ? distance : 2)
        break
      }
      case Opcode.JNZ: {
        const distance = sign8(loadFromMemory(getNextIP()))
        incIP(!isFlagSet(Flag.Zero) ? distance : 2)
        break
      }
      case Opcode.JS: {
        const distance = sign8(loadFromMemory(getNextIP()))
        incIP(isFlagSet(Flag.Sign) ? distance : 2)
        break
      }
      case Opcode.JNS: {
        const distance = sign8(loadFromMemory(getNextIP()))
        incIP(!isFlagSet(Flag.Sign) ? distance : 2)
        break
      }
      case Opcode.JO: {
        const distance = sign8(loadFromMemory(getNextIP()))
        incIP(isFlagSet(Flag.Overflow) ? distance : 2)
        break
      }
      case Opcode.JNO: {
        const distance = sign8(loadFromMemory(getNextIP()))
        incIP(!isFlagSet(Flag.Overflow) ? distance : 2)
        break
      }

      // Immediate Move
      case Opcode.MOV_NUM_TO_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const value = loadFromMemory(incIP())
        setGPR(destReg, value)
        incIP()
        break
      }

      // Direct Move
      case Opcode.MOV_ADDR_TO_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const address = loadFromMemory(incIP())
        setGPR(destReg, loadFromMemory(address))
        incIP()
        break
      }
      case Opcode.MOV_REG_TO_ADDR: {
        const address = loadFromMemory(incIP())
        const srcReg = checkGPR(loadFromMemory(incIP()))
        storeToMemory(address, getGPR(srcReg))
        incIP()
        break
      }

      // Indirect Move
      case Opcode.MOV_REG_ADDR_TO_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const srcReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, loadFromMemory(getGPR(srcReg)))
        incIP()
        break
      }
      case Opcode.MOV_REG_TO_REG_ADDR: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        const srcReg = checkGPR(loadFromMemory(incIP()))
        storeToMemory(getGPR(destReg), getGPR(srcReg))
        incIP()
        break
      }

      // Direct Register Comparison
      case Opcode.CMP_REG_WITH_REG: {
        const reg1 = checkGPR(loadFromMemory(incIP()))
        const reg2 = checkGPR(loadFromMemory(incIP()))
        const [, flags] = checkOperationResult(getGPR(reg1) - getGPR(reg2), getGPR(reg1))
        setSR(flags)
        incIP()
        break
      }

      // Immediate Comparison
      case Opcode.CMP_REG_WITH_NUM: {
        const reg = checkGPR(loadFromMemory(incIP()))
        const value = loadFromMemory(incIP())
        const [, flags] = checkOperationResult(getGPR(reg) - value, getGPR(reg))
        setSR(flags)
        incIP()
        break
      }

      // Direct Memory Comparison
      case Opcode.CMP_REG_WITH_ADDR: {
        const reg = checkGPR(loadFromMemory(incIP()))
        const address = loadFromMemory(incIP())
        const [, flags] = checkOperationResult(getGPR(reg) - loadFromMemory(address), getGPR(reg))
        setSR(flags)
        incIP()
        break
      }

      // Stack
      case Opcode.PUSH_FROM_REG: {
        const srcReg = checkGPR(loadFromMemory(incIP()))
        push(getGPR(srcReg))
        incIP()
        break
      }
      case Opcode.POP_TO_REG: {
        const destReg = checkGPR(loadFromMemory(incIP()))
        setGPR(destReg, pop())
        incIP()
        break
      }
      case Opcode.PUSHF: {
        push(getFlagsValue(getSR()))
        incIP()
        break
      }
      case Opcode.POPF: {
        setSR(getFlagsFromValue(pop()))
        incIP()
        break
      }

      // Procedures and Interrupts
      case Opcode.CALL_ADDR_NUM: {
        const address = loadFromMemory(incIP())
        push(incIP())
        setIP(address)
        break
      }
      case Opcode.RET: {
        setIP(pop())
        break
      }
      case Opcode.INT_ADDR_NUM: {
        const address = loadFromMemory(incIP())
        push(incIP())
        setIP(loadFromMemory(address))
        break
      }
      case Opcode.IRET: {
        // TODO: is it actually the same as `RET`?
        setIP(pop())
        break
      }

      // Input and Output
      case Opcode.IN_FROM_PORT_TO_AL: {
        const input = getInput()
        if (input === undefined) {
          const port = checkPort(loadFromMemory(getNextIP()))
          setPort(PortType.Input, port)
          break
        }
        setGPR(Register.AL, input)
        incIP(2)
        resetInput()
        break
      }
      case Opcode.OUT_FROM_AL_TO_PORT: {
        const port = checkPort(loadFromMemory(getNextIP()))
        setPort(PortType.Output, port)
        break
      }
    }
  })
