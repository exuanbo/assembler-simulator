import { createNextState } from '@reduxjs/toolkit'
import { MAX_SP, GeneralPurposeRegister, GeneralPurposeRegisterName } from './constants'
import type { RegisterChange, MemoryDataChange, StepChanges } from './changes'
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
  RunBeyondEndOfMemoryError,
  StackOverflowError,
  StackUnderflowError,
  InvalidPortError,
  InvalidOpcodeError
} from './exceptions'
import type { MemoryData } from '@/features/memory/core'
import { InputData, InputSignals, OutputSignals, Signals, MAX_PORT } from '@/features/io/core'
import { Opcode } from '@/common/constants'
import { ExcludeTail, sign8, unsign8 } from '@/common/utils'

export * from './constants'
export type { RuntimeErrorObject } from './exceptions'
export { RuntimeError } from './exceptions'

const HARDWARE_INTERRUPT_VECTOR_ADDR = 2

export type GeneralPurposeRegisters = [AL: number, BL: number, CL: number, DL: number]

export type InstructionPointer = number

export type StackPointer = number

export enum Flag {
  Zero,
  Overflow,
  Sign,
  Interrupt
}

enum FlagStatus {
  Off,
  On
}

export type StatusRegister = [
  zero: FlagStatus,
  overflow: FlagStatus,
  sign: FlagStatus,
  interrupt: FlagStatus
]

export interface Registers {
  gpr: GeneralPurposeRegisters
  ip: InstructionPointer
  sp: StackPointer
  sr: StatusRegister
}

export const initRegisters = (): Registers => {
  return {
    gpr: [0, 0, 0, 0],
    ip: 0,
    sp: MAX_SP,
    sr: [FlagStatus.Off, FlagStatus.Off, FlagStatus.Off, FlagStatus.Off]
  }
}

const checkGpr = (register: number): GeneralPurposeRegister => {
  if (register < GeneralPurposeRegister.AL || register > GeneralPurposeRegister.DL) {
    throw new InvalidRegisterError(register)
  }
  return register
}

const checkIp = (address: number): number => {
  if (address > 0xff) {
    throw new RunBeyondEndOfMemoryError()
  }
  return address
}

const checkSp = (address: number): number => {
  if (address < 0) {
    throw new StackOverflowError()
  }
  if (address > MAX_SP) {
    throw new StackUnderflowError()
  }
  return address
}

export const getSrValue = (sr: StatusRegister): number =>
  sr.reduce((value, flagStatus, index) => value + flagStatus * 0b10 ** (index + 1), 0)

export const getFlagFrom = (sr: StatusRegister, flag: Flag): boolean => sr[flag] === FlagStatus.On

const getSrFrom = (value: number): StatusRegister => {
  const valueStr = value.toString(2).padStart(5, '0') // I S O Z *
  return valueStr.slice(-5, -1).split('').map(Number).reverse() as StatusRegister
}

const checkOperationResult = (
  result: number,
  previousValue: number
): [finalResult: number, flags: ExcludeTail<StatusRegister>] => {
  const flags: ExcludeTail<StatusRegister> = [
    /* zero: */ FlagStatus.Off,
    /* overflow: */ FlagStatus.Off,
    /* sign: */ FlagStatus.Off
  ]
  if ((previousValue < 0x80 && result >= 0x80) || (previousValue >= 0x80 && result < 0x80)) {
    flags[Flag.Overflow] = FlagStatus.On
  }
  const finalResult = result > 0xff ? result % 0x100 : unsign8(result)
  if (finalResult === 0) {
    flags[Flag.Zero] = FlagStatus.On
  } else if (finalResult >= 0x80) {
    flags[Flag.Sign] = FlagStatus.On
  }
  return [finalResult, flags]
}

const checkPort = (port: number): number => {
  if (port < 0 || port > MAX_PORT) {
    throw new InvalidPortError(port)
  }
  return port
}

export interface StepResult {
  memoryData: MemoryData
  cpuRegisters: Registers
}

interface StepOutput extends StepResult {
  signals: Signals
  changes: StepChanges
}

export const step = (__stepResult: StepResult, __inputSignals: InputSignals): StepOutput => {
  const getInputData = (): InputData => __inputSignals.data
  const getInterrupt = (): boolean => __inputSignals.interrupt

  const __outputSignals: OutputSignals = {}

  const setHalted = (): void => {
    __outputSignals.halted = true
  }
  const setRequiredInputDataPort = (port: number): void => {
    __outputSignals.requiredInputDataPort = port
  }
  const setOutputData = (content: number, port: number): void => {
    __outputSignals.data = { content, port }
  }
  const setInterruptFlag = (value: boolean): void => {
    __outputSignals.interruptFlagSet = value
  }
  const setCloseWindows = (): void => {
    __outputSignals.closeWindows = true
  }

  const signals = {
    input: __inputSignals,
    output: __outputSignals
  }

  const changes: StepChanges = { cpuRegisters: {} }
  const setMemoryChange = (change: MemoryDataChange): void => {
    changes.memoryData = change
  }
  const setRegisterChange = (name: keyof Registers, change: RegisterChange): void => {
    changes.cpuRegisters[name] = change
  }

  const stepResult: StepResult = createNextState(__stepResult, ({ memoryData, cpuRegisters }) => {
    const loadFromMemory = (address: number): number => {
      return memoryData[address]
    }
    const storeToMemory = (address: number, value: number): void => {
      memoryData[address] = value
      setMemoryChange({ address, value })
    }

    const getGpr = (register: GeneralPurposeRegister): number => cpuRegisters.gpr[register]
    const setGpr = (register: GeneralPurposeRegister, value: number): void => {
      cpuRegisters.gpr[register] = value
      setRegisterChange('gpr', {
        name: GeneralPurposeRegister[register] as GeneralPurposeRegisterName,
        value
      })
    }

    const getIp = (): number => cpuRegisters.ip
    const getNextIp = (by = 1): number => cpuRegisters.ip + by
    const setIp = (address: number): void => {
      cpuRegisters.ip = address
      setRegisterChange('ip', { value: address })
    }

    /**
     * @modifies {@link cpuRegisters.ip}
     */
    const incIp = (by = 1): number => {
      setIp(checkIp(cpuRegisters.ip + by))
      return cpuRegisters.ip
    }

    const push = (value: number): void => {
      storeToMemory(cpuRegisters.sp, value)
      const address = checkSp(cpuRegisters.sp - 1)
      cpuRegisters.sp = address
      setRegisterChange('sp', { value: address })
    }
    const pop = (): number => {
      const address = checkSp(cpuRegisters.sp + 1)
      cpuRegisters.sp = address
      setRegisterChange('sp', { value: address })
      return loadFromMemory(cpuRegisters.sp)
    }

    const getSr = (): StatusRegister => cpuRegisters.sr
    const setSr = (flags: Partial<StatusRegister>): void => {
      Object.assign(cpuRegisters.sr, flags)
      setRegisterChange('sr', { value: getSrValue(cpuRegisters.sr) })
    }
    const getFlag = (flag: Flag): boolean => getFlagFrom(cpuRegisters.sr, flag)
    const setFlag = (flag: Flag, flagStatus: FlagStatus): void => {
      cpuRegisters.sr[flag] = flagStatus
      setRegisterChange('sr', { value: getSrValue(cpuRegisters.sr) })
    }

    /**
     * @modifies {@link cpuRegisters.sr}
     */
    const operate = <T extends [number] | [number, number]>(
      operation: (...operands: T) => number,
      ...operands: T
    ): number => {
      const [finalResult, flags] = checkOperationResult(
        operation(...operands),
        operands[operands.length - 1]
      )
      setSr(flags)
      return finalResult
    }

    /* ------------------------------------------------------------------------------------------ */

    const shouldTrapHardwareInterrupt = getInterrupt() && getFlag(Flag.Interrupt)

    const opcode = shouldTrapHardwareInterrupt ? Opcode.INT_ADDR : loadFromMemory(getIp())

    switch (opcode) {
      case Opcode.END:
      case Opcode.HALT:
        setHalted()
        break

      // Direct Arithmetic
      case Opcode.ADD_REG_TO_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const srcReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(add, getGpr(srcReg), getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.SUB_REG_FROM_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const srcReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(substract, getGpr(srcReg), getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.MUL_REG_BY_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const srcReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(multiply, getGpr(srcReg), getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.DIV_REG_BY_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const srcReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(divide, getGpr(srcReg), getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.INC_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(increase, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.DEC_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(decrease, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.MOD_REG_BY_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const srcReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(modulo, getGpr(srcReg), getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.AND_REG_WITH_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const srcReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(and, getGpr(srcReg), getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.OR_REG_WITH_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const srcReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(or, getGpr(srcReg), getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.XOR_REG_WITH_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const srcReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(xor, getGpr(srcReg), getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.NOT_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(not, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.ROL_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(rol, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.ROR_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(ror, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.SHL_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(shl, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.SHR_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(shr, getGpr(destReg)))
        incIp()
        break
      }

      // Immediate Arithmetic
      case Opcode.ADD_NUM_TO_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, operate(add, value, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.SUB_NUM_FROM_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, operate(substract, value, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.MUL_REG_BY_NUM: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, operate(multiply, value, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.DIV_REG_BY_NUM: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, operate(divide, value, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.MOD_REG_BY_NUM: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, operate(modulo, value, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.AND_REG_WITH_NUM: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, operate(and, value, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.OR_REG_WITH_NUM: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, operate(or, value, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.XOR_REG_WITH_NUM: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, operate(xor, value, getGpr(destReg)))
        incIp()
        break
      }

      // Jump
      case Opcode.JMP: {
        const distance = sign8(loadFromMemory(getNextIp()))
        incIp(distance)
        break
      }
      case Opcode.JZ: {
        const distance = sign8(loadFromMemory(getNextIp()))
        incIp(getFlag(Flag.Zero) ? distance : 2)
        break
      }
      case Opcode.JNZ: {
        const distance = sign8(loadFromMemory(getNextIp()))
        incIp(!getFlag(Flag.Zero) ? distance : 2)
        break
      }
      case Opcode.JS: {
        const distance = sign8(loadFromMemory(getNextIp()))
        incIp(getFlag(Flag.Sign) ? distance : 2)
        break
      }
      case Opcode.JNS: {
        const distance = sign8(loadFromMemory(getNextIp()))
        incIp(!getFlag(Flag.Sign) ? distance : 2)
        break
      }
      case Opcode.JO: {
        const distance = sign8(loadFromMemory(getNextIp()))
        incIp(getFlag(Flag.Overflow) ? distance : 2)
        break
      }
      case Opcode.JNO: {
        const distance = sign8(loadFromMemory(getNextIp()))
        incIp(!getFlag(Flag.Overflow) ? distance : 2)
        break
      }

      // Immediate Move
      case Opcode.MOV_NUM_TO_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, value)
        incIp()
        break
      }

      // Direct Move
      case Opcode.MOV_ADDR_TO_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const address = loadFromMemory(incIp())
        setGpr(destReg, loadFromMemory(address))
        incIp()
        break
      }
      case Opcode.MOV_REG_TO_ADDR: {
        const address = loadFromMemory(incIp())
        const srcReg = checkGpr(loadFromMemory(incIp()))
        storeToMemory(address, getGpr(srcReg))
        incIp()
        break
      }

      // Indirect Move
      case Opcode.MOV_REG_ADDR_TO_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const srcReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, loadFromMemory(getGpr(srcReg)))
        incIp()
        break
      }
      case Opcode.MOV_REG_TO_REG_ADDR: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        const srcReg = checkGpr(loadFromMemory(incIp()))
        storeToMemory(getGpr(destReg), getGpr(srcReg))
        incIp()
        break
      }

      // Direct Register Comparison
      case Opcode.CMP_REG_WITH_REG: {
        const reg1 = checkGpr(loadFromMemory(incIp()))
        const reg2 = checkGpr(loadFromMemory(incIp()))
        const [, flags] = checkOperationResult(getGpr(reg1) - getGpr(reg2), getGpr(reg1))
        setSr(flags)
        incIp()
        break
      }

      // Immediate Comparison
      case Opcode.CMP_REG_WITH_NUM: {
        const reg = checkGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        const [, flags] = checkOperationResult(getGpr(reg) - value, getGpr(reg))
        setSr(flags)
        incIp()
        break
      }

      // Direct Memory Comparison
      case Opcode.CMP_REG_WITH_ADDR: {
        const reg = checkGpr(loadFromMemory(incIp()))
        const address = loadFromMemory(incIp())
        const [, flags] = checkOperationResult(getGpr(reg) - loadFromMemory(address), getGpr(reg))
        setSr(flags)
        incIp()
        break
      }

      // Stack
      case Opcode.PUSH_FROM_REG: {
        const srcReg = checkGpr(loadFromMemory(incIp()))
        push(getGpr(srcReg))
        incIp()
        break
      }
      case Opcode.POP_TO_REG: {
        const destReg = checkGpr(loadFromMemory(incIp()))
        setGpr(destReg, pop())
        incIp()
        break
      }
      case Opcode.PUSHF: {
        push(getSrValue(getSr()))
        incIp()
        break
      }
      case Opcode.POPF: {
        const flags = getSrFrom(pop())
        setSr(flags)
        incIp()
        break
      }

      // Procedures and Interrupts
      case Opcode.CALL_ADDR: {
        const address = loadFromMemory(getNextIp())
        push(getNextIp(2))
        setIp(address)
        break
      }
      case Opcode.RET: {
        setIp(pop())
        break
      }
      case Opcode.INT_ADDR: {
        if (shouldTrapHardwareInterrupt) {
          push(getIp())
          setIp(loadFromMemory(HARDWARE_INTERRUPT_VECTOR_ADDR))
          break
        }
        const address = loadFromMemory(getNextIp())
        push(getNextIp(2))
        setIp(loadFromMemory(address))
        break
      }
      case Opcode.IRET: {
        setIp(pop())
        break
      }

      // Input and Output
      case Opcode.IN_FROM_PORT_TO_AL: {
        const inputData = getInputData()
        const requiredInputDataPort = checkPort(loadFromMemory(getNextIp()))
        if (inputData.content === null || inputData.port !== requiredInputDataPort) {
          setRequiredInputDataPort(requiredInputDataPort)
          break
        }
        setGpr(GeneralPurposeRegister.AL, inputData.content)
        incIp(2)
        break
      }
      case Opcode.OUT_FROM_AL_TO_PORT: {
        const dataContent = getGpr(GeneralPurposeRegister.AL)
        const dataPort = checkPort(loadFromMemory(incIp()))
        setOutputData(dataContent, dataPort)
        incIp()
        break
      }

      // Miscellaneous
      case Opcode.STI: {
        setFlag(Flag.Interrupt, FlagStatus.On)
        setInterruptFlag(true)
        incIp()
        break
      }
      case Opcode.CLI: {
        setFlag(Flag.Interrupt, FlagStatus.Off)
        setInterruptFlag(false)
        incIp()
        break
      }
      case Opcode.CLO: {
        setCloseWindows()
        incIp()
        break
      }
      case Opcode.NOP: {
        incIp()
        break
      }

      default: {
        throw new InvalidOpcodeError(opcode)
      }
    }
  })

  return { ...stepResult, signals, changes }
}
