import { produce } from 'immer'

import { Opcode } from '@/common/constants'
import { sign8, unsign8 } from '@/common/utils'
import {
  type InputData,
  type InputSignals,
  MAX_PORT,
  type OutputSignals,
  type Signals,
  SKIP,
} from '@/features/io/core'
import type { MemoryData } from '@/features/memory/core'

import type { MemoryDataChange, RegisterChange, StepChanges } from './changes'
import { GeneralPurposeRegister, MAX_SP } from './constants'
import {
  InvalidInputDataError,
  InvalidOpcodeError,
  InvalidPortError,
  InvalidRegisterError,
  RunBeyondEndOfMemoryError,
  StackOverflowError,
  StackUnderflowError,
} from './exceptions'
import {
  add,
  and,
  decrease,
  divide,
  increase,
  modulo,
  multiply,
  not,
  or,
  rol,
  ror,
  shl,
  shr,
  subtract,
  xor,
} from './operations'

export * from './constants'
export type { RuntimeErrorObject } from './exceptions'
export { RuntimeError } from './exceptions'

const HARDWARE_INTERRUPT_VECTOR_ADDR = 2

export type GeneralPurposeRegisters = [AL: number, BL: number, CL: number, DL: number]

export type InstructionPointer = number

export type StackPointer = number

export enum StatusRegisterFlag {
  Zero = 0b10 << 0,
  Overflow = 0b10 << 1,
  Sign = 0b10 << 2,
  Interrupt = 0b10 << 3,
}

export type StatusRegister = number

const __getSrFlag = (sr: StatusRegister, flag: number): boolean => (sr & flag) === flag

// istanbul ignore next
export const __getSrInterruptFlag = (sr: StatusRegister): boolean =>
  __getSrFlag(sr, StatusRegisterFlag.Interrupt)

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
    sr: 0,
  }
}

const validateGpr = (register: number): GeneralPurposeRegister => {
  if (register > GeneralPurposeRegister.DL) {
    throw new InvalidRegisterError(register)
  }
  return register
}

const validateIp = (address: number): number => {
  if (address > 0xff) {
    throw new RunBeyondEndOfMemoryError()
  }
  return address
}

const validateSp = (address: number): number => {
  if (address < 0) {
    throw new StackOverflowError()
  }
  if (address > MAX_SP) {
    throw new StackUnderflowError()
  }
  return address
}

const validatePort = (port: number): number => {
  if (port > MAX_PORT) {
    throw new InvalidPortError(port)
  }
  return port
}

const validateInputData = (content: number): number => {
  if (content > 0xff) {
    throw new InvalidInputDataError(content)
  }
  return content
}

export interface StepResult {
  memoryData: MemoryData
  cpuRegisters: Registers
}

export interface StepOutput extends StepResult {
  signals: Signals
  changes: StepChanges
}

export const step = (lastStepResult: StepResult, inputSignals: InputSignals): StepOutput => {
  const getInputData = (): InputData => inputSignals.data
  const getInterruptSignal = (): boolean => inputSignals.interrupt

  const outputSignals: OutputSignals = {}

  const setHalted = (): void => {
    outputSignals.halted = true
  }
  const setCloseWindows = (): void => {
    outputSignals.closeWindows = true
  }
  const setExpectedInputPort = (port: number): void => {
    outputSignals.expectedInputPort = port
  }
  const setOutputData = (content: number, port: number): void => {
    outputSignals.data = { content, port }
  }

  const signals = {
    input: inputSignals,
    output: outputSignals,
  }

  const changes: StepChanges = {}
  const setMemoryChange = (change: MemoryDataChange): void => {
    changes.memoryData = change
  }
  const setRegisterChange = (registerKey: keyof Registers, change: RegisterChange): void => {
    changes.cpuRegisters ??= {}
    changes.cpuRegisters[registerKey] = change
  }

  /* -------------------------------------------------------------------------------------------- */

  const stepResult = produce(lastStepResult, (draft) => {
    const { memoryData: __memoryData, cpuRegisters: __cpuRegisters } = draft

    const loadFromMemory = (address: number): number => {
      return __memoryData[address]
    }
    const storeToMemory = (address: number, value: number): void => {
      __memoryData[address] = value
      setMemoryChange({ address, value })
    }

    const getGpr = (register: GeneralPurposeRegister): number => __cpuRegisters.gpr[register]
    const setGpr = (register: GeneralPurposeRegister, value: number): void => {
      __cpuRegisters.gpr[register] = value
      setRegisterChange('gpr', {
        name: GeneralPurposeRegister[register],
        value,
      })
    }

    const getIp = (): number => __cpuRegisters.ip
    const getNextIp = (by = 1): number => __cpuRegisters.ip + by
    const setIp = (address: number): void => {
      __cpuRegisters.ip = address
      setRegisterChange('ip', { value: address })
    }

    /**
     * @modifies {@link __cpuRegisters.ip}
     */
    const incIp = (by = 1): number => {
      setIp(validateIp(__cpuRegisters.ip + by))
      return __cpuRegisters.ip
    }

    const push = (value: number): void => {
      storeToMemory(__cpuRegisters.sp, value)
      const address = validateSp(__cpuRegisters.sp - 1)
      __cpuRegisters.sp = address
      setRegisterChange('sp', { value: address })
    }
    const pop = (): number => {
      const address = validateSp(__cpuRegisters.sp + 1)
      __cpuRegisters.sp = address
      setRegisterChange('sp', { value: address })
      return loadFromMemory(__cpuRegisters.sp)
    }

    const getSr = (): number => __cpuRegisters.sr
    const setSr = (flags: number): void => {
      __cpuRegisters.sr = flags
      setRegisterChange('sr', { value: __cpuRegisters.sr })
    }
    const getSrFlag = (flag: StatusRegisterFlag): boolean => __getSrFlag(__cpuRegisters.sr, flag)
    const setSrInterruptFlag = (on: boolean): void => {
      const flags = __cpuRegisters.sr
      __cpuRegisters.sr = on
        ? flags | StatusRegisterFlag.Interrupt
        : flags & ~StatusRegisterFlag.Interrupt
      setRegisterChange('sr', {
        interrupt: true,
        value: __cpuRegisters.sr,
      })
    }

    /**
     * @modifies {@link __cpuRegisters.sr}
     */
    const operate = <T extends [number] | [number, number]>(
      operation: (...operands: T) => number,
      ...operands: T
    ): number => {
      const currentValue = operands[operands.length - 1]
      const __result = operation(...operands)
      let flags = 0
      if ((currentValue < 0x80 && __result >= 0x80) || (currentValue >= 0x80 && __result < 0x80)) {
        flags |= StatusRegisterFlag.Overflow
      }
      const result = __result > 0xff ? __result % 0x100 : unsign8(__result)
      switch (true) {
        case result === 0:
          flags |= StatusRegisterFlag.Zero
          break
        case result >= 0x80:
          flags |= StatusRegisterFlag.Sign
          break
      }
      const interruptFlag = __cpuRegisters.sr & StatusRegisterFlag.Interrupt
      setSr(flags | interruptFlag)
      return result
    }

    /* ------------------------------------------------------------------------------------------ */

    const shouldTrapHardwareInterrupt =
      getInterruptSignal() && getSrFlag(StatusRegisterFlag.Interrupt)

    const opcode = shouldTrapHardwareInterrupt ? Opcode.INT_ADDR : loadFromMemory(getIp())

    switch (opcode) {
      case Opcode.END:
      case Opcode.HALT: {
        setHalted()
        break
      }

      // Direct Arithmetic
      case Opcode.ADD_REG_TO_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const srcReg = validateGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(add, getGpr(srcReg), getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.SUB_REG_FROM_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const srcReg = validateGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(subtract, getGpr(srcReg), getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.MUL_REG_BY_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const srcReg = validateGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(multiply, getGpr(srcReg), getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.DIV_REG_BY_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const srcReg = validateGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(divide, getGpr(srcReg), getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.INC_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(increase, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.DEC_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(decrease, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.MOD_REG_BY_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const srcReg = validateGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(modulo, getGpr(srcReg), getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.AND_REG_WITH_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const srcReg = validateGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(and, getGpr(srcReg), getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.OR_REG_WITH_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const srcReg = validateGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(or, getGpr(srcReg), getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.XOR_REG_WITH_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const srcReg = validateGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(xor, getGpr(srcReg), getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.NOT_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(not, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.ROL_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(rol, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.ROR_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(ror, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.SHL_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(shl, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.SHR_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        setGpr(destReg, operate(shr, getGpr(destReg)))
        incIp()
        break
      }

      // Immediate Arithmetic
      case Opcode.ADD_IMM_TO_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, operate(add, value, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.SUB_IMM_FROM_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, operate(subtract, value, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.MUL_REG_BY_IMM: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, operate(multiply, value, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.DIV_REG_BY_IMM: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, operate(divide, value, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.MOD_REG_BY_IMM: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, operate(modulo, value, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.AND_REG_WITH_IMM: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, operate(and, value, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.OR_REG_WITH_IMM: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, operate(or, value, getGpr(destReg)))
        incIp()
        break
      }
      case Opcode.XOR_REG_WITH_IMM: {
        const destReg = validateGpr(loadFromMemory(incIp()))
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
        incIp(getSrFlag(StatusRegisterFlag.Zero) ? distance : 2)
        break
      }
      case Opcode.JNZ: {
        const distance = sign8(loadFromMemory(getNextIp()))
        incIp(!getSrFlag(StatusRegisterFlag.Zero) ? distance : 2)
        break
      }
      case Opcode.JS: {
        const distance = sign8(loadFromMemory(getNextIp()))
        incIp(getSrFlag(StatusRegisterFlag.Sign) ? distance : 2)
        break
      }
      case Opcode.JNS: {
        const distance = sign8(loadFromMemory(getNextIp()))
        incIp(!getSrFlag(StatusRegisterFlag.Sign) ? distance : 2)
        break
      }
      case Opcode.JO: {
        const distance = sign8(loadFromMemory(getNextIp()))
        incIp(getSrFlag(StatusRegisterFlag.Overflow) ? distance : 2)
        break
      }
      case Opcode.JNO: {
        const distance = sign8(loadFromMemory(getNextIp()))
        incIp(!getSrFlag(StatusRegisterFlag.Overflow) ? distance : 2)
        break
      }

      // Immediate Move
      case Opcode.MOV_IMM_TO_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        setGpr(destReg, value)
        incIp()
        break
      }

      // Direct Move
      case Opcode.MOV_VAL_FROM_ADDR_TO_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const address = loadFromMemory(incIp())
        setGpr(destReg, loadFromMemory(address))
        incIp()
        break
      }
      case Opcode.MOV_REG_TO_ADDR: {
        const address = loadFromMemory(incIp())
        const srcReg = validateGpr(loadFromMemory(incIp()))
        storeToMemory(address, getGpr(srcReg))
        incIp()
        break
      }

      // Indirect Move
      case Opcode.MOV_VAL_FROM_REG_ADDR_TO_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const srcReg = validateGpr(loadFromMemory(incIp()))
        const address = getGpr(srcReg)
        setGpr(destReg, loadFromMemory(address))
        incIp()
        break
      }
      case Opcode.MOV_REG_TO_REG_ADDR: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        const address = getGpr(destReg)
        const srcReg = validateGpr(loadFromMemory(incIp()))
        storeToMemory(address, getGpr(srcReg))
        incIp()
        break
      }

      // Direct Register Comparison
      case Opcode.CMP_REG_WITH_REG: {
        const reg1 = validateGpr(loadFromMemory(incIp()))
        const reg2 = validateGpr(loadFromMemory(incIp()))
        operate(subtract, getGpr(reg2), getGpr(reg1))
        incIp()
        break
      }

      // Immediate Comparison
      case Opcode.CMP_REG_WITH_IMM: {
        const reg = validateGpr(loadFromMemory(incIp()))
        const value = loadFromMemory(incIp())
        operate(subtract, value, getGpr(reg))
        incIp()
        break
      }

      // Direct Memory Comparison
      case Opcode.CMP_REG_WITH_VAL_FROM_ADDR: {
        const reg = validateGpr(loadFromMemory(incIp()))
        const address = loadFromMemory(incIp())
        operate(subtract, loadFromMemory(address), getGpr(reg))
        incIp()
        break
      }

      // Stack
      case Opcode.PUSH_FROM_REG: {
        const srcReg = validateGpr(loadFromMemory(incIp()))
        push(getGpr(srcReg))
        incIp()
        break
      }
      case Opcode.POP_TO_REG: {
        const destReg = validateGpr(loadFromMemory(incIp()))
        setGpr(destReg, pop())
        incIp()
        break
      }
      case Opcode.PUSHF: {
        push(getSr())
        incIp()
        break
      }
      case Opcode.POPF: {
        setSr(pop())
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
        const expectedInputPort = validatePort(loadFromMemory(getNextIp()))
        if (inputData.content === null || inputData.port !== expectedInputPort) {
          setExpectedInputPort(expectedInputPort)
          break
        }
        if (inputData.content !== SKIP) {
          setGpr(GeneralPurposeRegister.AL, validateInputData(inputData.content))
        }
        incIp(2)
        break
      }
      case Opcode.OUT_FROM_AL_TO_PORT: {
        const content = getGpr(GeneralPurposeRegister.AL)
        const port = validatePort(loadFromMemory(incIp()))
        setOutputData(content, port)
        incIp()
        break
      }

      // Miscellaneous
      case Opcode.STI: {
        setSrInterruptFlag(true)
        incIp()
        break
      }
      case Opcode.CLI: {
        setSrInterruptFlag(false)
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
