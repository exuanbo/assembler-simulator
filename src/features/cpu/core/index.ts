import { createNextState } from '@reduxjs/toolkit'
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
} from './exceptions'
import type { MemoryData } from '../../memory/core'
import { Opcode, GeneralPurposeRegister } from '../../../common/constants'
import { NullablePartial, ExcludeTail, sign8, unsign8 } from '../../../common/utils'

export { RuntimeError } from './exceptions'

const HARDWARE_INTERRUPT_VECTOR_ADDR = 2

type GPR = [AL: number, BL: number, CL: number, DL: number]

const MAX_SP = 0xbf

enum Flag {
  Zero,
  Overflow,
  Sign,
  Interrupt
}

enum FlagStatus {
  Off,
  On
}

type SR = [zero: FlagStatus, overflow: FlagStatus, sign: FlagStatus, interrupt: FlagStatus]

export interface Registers {
  gpr: GPR
  ip: number
  sp: number
  sr: SR
}

export const initRegisters = (): Registers => {
  return {
    gpr: [0, 0, 0, 0],
    ip: 0,
    sp: MAX_SP,
    sr: [FlagStatus.Off, FlagStatus.Off, FlagStatus.Off, FlagStatus.Off]
  }
}

const checkGPR = (register: number): GeneralPurposeRegister => {
  if (register < GeneralPurposeRegister.AL || register > GeneralPurposeRegister.DL) {
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

export const getFlagsValue = (sr: SR): number =>
  sr.reduce((value, flagStatus, index) => value + flagStatus * 0b10 ** (index + 1), 0)

const getFlagsFromValue = (value: number): SR => {
  const valueStr = value.toString(2).padStart(5, '0')
  return valueStr
    .slice(-5, -1)
    .split('')
    .map(val => Number.parseInt(val))
    .reduceRight<FlagStatus[]>((result, flagStatus) => [...result, flagStatus], []) as SR
}

const checkOperationResult = (
  result: number,
  previousValue: number
): [finalResult: number, flags: ExcludeTail<SR>] => {
  const flags: ExcludeTail<SR> = [
    /* zero */ FlagStatus.Off,
    /* overflow */ FlagStatus.Off,
    /* sign */ FlagStatus.Off
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

export enum InputPort {
  SimulatedKeyboard = 0,
  Thermostat = 3,
  Keyboard = 7,
  NumericKeypad = 8
}

export type InputSignals = (
  | {
      data: number
      inputPort: InputPort
    }
  | {
      data: undefined
      inputPort: undefined
    }
) & {
  interrupt: boolean
  // TODO: interruptVectorAddress
}

enum OutputPort {
  TrafficLights = 1,
  SevenSegmentDisplay = 2,
  Heater = 3,
  SnakeInMaze = 4,
  StepperMotor = 5,
  Lift = 6,
  Keyboard = 7,
  NumericKeypad = 8
}

type OutputOnlySignals = NullablePartial<{
  halted: true
  outputPort: OutputPort
  closeWindows: true
}>

type Signals = InputSignals & OutputOnlySignals

enum PortType {
  Input = 'input',
  Output = 'output'
}

const MAX_PORT = 0x0f

const checkPort = (port: number): number => {
  if (port < 0 || port > MAX_PORT) {
    throw new PortError()
  }
  return port
}

type StepArgs = [memoryData: MemoryData, cpuRegisters: Registers, signals: Signals]
export type StepResult = ExcludeTail<StepArgs>

export const step = (...args: StepArgs): [...StepResult, Signals] =>
  createNextState(args, ([memoryData, cpuRegisters, signals]) => {
    /* -------------------------------------------------------------------------- */
    /*                                    Init                                    */
    /* -------------------------------------------------------------------------- */

    const loadFromMemory = (address: number): number => {
      return memoryData[address]
    }
    const storeToMemory = (address: number, machineCode: number): void => {
      memoryData[address] = machineCode
    }

    const getGPR = (register: GeneralPurposeRegister): number => cpuRegisters.gpr[register]
    const setGPR = (register: GeneralPurposeRegister, value: number): void => {
      cpuRegisters.gpr[register] = value
    }

    const getIP = (): number => cpuRegisters.ip
    const getNextIP = (by = 1): number => getIP() + by
    const setIP = (address: number): void => {
      cpuRegisters.ip = address
    }

    /**
     * @modifies {@link cpuRegisters.ip}
     */
    const incIP = (by = 1): number => {
      setIP(checkIP(getIP() + by))
      return getIP()
    }

    const getSP = (): number => cpuRegisters.sp
    const setSP = (address: number): void => {
      cpuRegisters.sp = address
    }
    const push = (value: number): void => {
      storeToMemory(getSP(), value)
      setSP(checkSP(getSP() - 1))
    }
    const pop = (): number => {
      setSP(checkSP(getSP() + 1))
      return loadFromMemory(getSP())
    }

    const getSR = (): SR => cpuRegisters.sr
    const setSR = (flags: Partial<SR>): void => {
      Object.assign(cpuRegisters.sr, flags)
    }
    const isFlagOn = (flag: Flag): boolean => getSR()[flag] === FlagStatus.On
    const setFlag = (flag: Flag, flagStatus: FlagStatus): void => {
      getSR()[flag] = flagStatus
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
      setSR(flags)
      return finalResult
    }

    const setSignal = <S extends keyof Signals>(
      signalName: S,
      value: NonNullable<Signals[S]>
    ): void => {
      signals[signalName] = value
    }
    const getInput = (): Pick<InputSignals, 'data' | 'inputPort'> =>
      (({ data, inputPort }) => ({ data, inputPort }))(signals)
    const setPort = (type: PortType, port: number): void => {
      setSignal(`${type}Port`, port)
    }
    const setHaltedSignal = (): void => {
      setSignal('halted', true)
    }
    const getInterruptSignal = (): boolean => signals.interrupt
    const setCloseWindowsSignal = (): void => {
      setSignal('closeWindows', true)
    }

    /* -------------------------------------------------------------------------- */
    /*                                     Run                                    */
    /* -------------------------------------------------------------------------- */

    const shouldTrapHardwareInterrupt = getInterruptSignal() && isFlagOn(Flag.Interrupt)

    const opcode = shouldTrapHardwareInterrupt ? Opcode.INT_ADDR : loadFromMemory(getIP())

    switch (opcode) {
      case Opcode.END:
      case Opcode.HALT:
        setHaltedSignal()
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
        incIP(isFlagOn(Flag.Zero) ? distance : 2)
        break
      }
      case Opcode.JNZ: {
        const distance = sign8(loadFromMemory(getNextIP()))
        incIP(!isFlagOn(Flag.Zero) ? distance : 2)
        break
      }
      case Opcode.JS: {
        const distance = sign8(loadFromMemory(getNextIP()))
        incIP(isFlagOn(Flag.Sign) ? distance : 2)
        break
      }
      case Opcode.JNS: {
        const distance = sign8(loadFromMemory(getNextIP()))
        incIP(!isFlagOn(Flag.Sign) ? distance : 2)
        break
      }
      case Opcode.JO: {
        const distance = sign8(loadFromMemory(getNextIP()))
        incIP(isFlagOn(Flag.Overflow) ? distance : 2)
        break
      }
      case Opcode.JNO: {
        const distance = sign8(loadFromMemory(getNextIP()))
        incIP(!isFlagOn(Flag.Overflow) ? distance : 2)
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
        const flags = getFlagsFromValue(pop())
        setSR(flags)
        incIP()
        break
      }

      // Procedures and Interrupts
      case Opcode.CALL_ADDR: {
        const address = loadFromMemory(getNextIP())
        push(getNextIP(2))
        setIP(address)
        break
      }
      case Opcode.RET: {
        setIP(pop())
        break
      }
      case Opcode.INT_ADDR: {
        if (shouldTrapHardwareInterrupt) {
          push(getIP())
          setIP(loadFromMemory(HARDWARE_INTERRUPT_VECTOR_ADDR))
          break
        }
        const address = loadFromMemory(getNextIP())
        push(getNextIP(2))
        setIP(loadFromMemory(address))
        break
      }
      case Opcode.IRET: {
        setIP(pop())
        break
      }

      // Input and Output
      case Opcode.IN_FROM_PORT_TO_AL: {
        const { data, inputPort } = getInput()
        const requiredPort = checkPort(loadFromMemory(getNextIP()))
        if (data === undefined || inputPort !== requiredPort) {
          setPort(PortType.Input, requiredPort)
          break
        }
        setGPR(GeneralPurposeRegister.AL, data)
        incIP(2)
        break
      }
      case Opcode.OUT_FROM_AL_TO_PORT: {
        const port = checkPort(loadFromMemory(incIP()))
        incIP()
        setPort(PortType.Output, port)
        break
      }

      // Miscellaneous
      case Opcode.STI: {
        setFlag(Flag.Interrupt, FlagStatus.On)
        incIP()
        break
      }
      case Opcode.CLI: {
        setFlag(Flag.Interrupt, FlagStatus.Off)
        incIP()
        break
      }
      case Opcode.CLO: {
        setCloseWindowsSignal()
        incIP()
        break
      }
      case Opcode.NOP: {
        incIP()
        break
      }
    }
  })
