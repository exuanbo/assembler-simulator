import { produce } from 'immer'
import {
  InvalidRegisterError,
  RunBeyondEndOfMemory,
  // StackOverflowError,
  // StackUnderflowError,
  DivideByZeroError
} from '../../common/exceptions'
import { Opcode, Register } from '../../common/constants'
import { Head, sign8, unsign8, exp } from '../../common/utils'

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

// const checkSP = (address: number): number => {
//   if (address < 0) {
//     throw new StackOverflowError()
//   }
//   if (address > MAX_SP) {
//     throw new StackUnderflowError()
//   }
//   return address
// }

// const getFlagsValue = (sr: SR): number =>
//   sr.reduce((result, isSet, flag) => (isSet ? result + 0b10 ** flag : result), 0)

const checkDivisor = (value: number): number => {
  if (value === 0) {
    throw new DivideByZeroError()
  }
  return value
}

const divide = (dividend: number, divisor: number): number =>
  Math.floor(dividend / checkDivisor(divisor))

const modulo = (dividend: number, divisor: number): number => dividend % checkDivisor(divisor)

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

export const step = (__memory: number[], __cpu: CPU): [memory: number[], cpu: CPU] =>
  produce([__memory, __cpu], ([memory, cpu]) => {
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

    const setIP = (address: number): void => {
      cpu.ip = address
    }
    const incIP = (value?: number): void => {
      setIP(checkIP(cpu.ip + (value ?? 1)))
    }

    /**
     * @modifies {@link cpu.ip}
     */
    const getNextMachineCode = (): number => {
      incIP()
      return loadFromMemory(cpu.ip)
    }

    const getSR = (flag: Flag): boolean => cpu.sr[flag]
    const setSR = (flags: Partial<SR>): void => {
      Object.assign(cpu.sr, flags)
    }

    /**
     * @modifies {@link cpu.sr}
     */
    const getOperationResult = (result: number, previousValue: number): number => {
      const [finalResult, flags] = checkOperationResult(result, previousValue)
      setSR(flags)
      return finalResult
    }

    const jumpIf = (predicate: boolean, distance: number): void => {
      incIP(predicate ? distance - 1 : 1)
    }

    const opcode = loadFromMemory(cpu.ip)

    switch (opcode) {
      case Opcode.END:
        // TODO setHalted()
        cpu.isHalted = true
        break

      // Direct Arithmetic
      case Opcode.ADD_REG_TO_REG: {
        const destReg = checkGPR(getNextMachineCode())
        const srcReg = checkGPR(getNextMachineCode())
        setGPR(destReg, getOperationResult(getGPR(destReg) + getGPR(srcReg), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.SUB_REG_FROM_REG: {
        const destReg = checkGPR(getNextMachineCode())
        const srcReg = checkGPR(getNextMachineCode())
        setGPR(destReg, getOperationResult(getGPR(destReg) - getGPR(srcReg), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.MUL_REG_BY_REG: {
        const destReg = checkGPR(getNextMachineCode())
        const srcReg = checkGPR(getNextMachineCode())
        setGPR(destReg, getOperationResult(getGPR(destReg) * getGPR(srcReg), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.DIV_REG_BY_REG: {
        const destReg = checkGPR(getNextMachineCode())
        const srcReg = checkGPR(getNextMachineCode())
        setGPR(
          destReg,
          getOperationResult(divide(getGPR(destReg), getGPR(srcReg)), getGPR(destReg))
        )
        incIP()
        break
      }
      case Opcode.INC_REG: {
        const destReg = checkGPR(getNextMachineCode())
        setGPR(destReg, getOperationResult(getGPR(destReg) + 1, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.DEC_REG: {
        const destReg = checkGPR(getNextMachineCode())
        setGPR(destReg, getOperationResult(getGPR(destReg) - 1, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.MOD_REG_BY_REG: {
        const destReg = checkGPR(getNextMachineCode())
        const srcReg = checkGPR(getNextMachineCode())
        setGPR(
          destReg,
          getOperationResult(modulo(getGPR(destReg), getGPR(srcReg)), getGPR(destReg))
        )
        incIP()
        break
      }
      case Opcode.AND_REG_WITH_REG: {
        const destReg = checkGPR(getNextMachineCode())
        const srcReg = checkGPR(getNextMachineCode())
        setGPR(destReg, getOperationResult(getGPR(destReg) & getGPR(srcReg), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.OR_REG_WITH_REG: {
        const destReg = checkGPR(getNextMachineCode())
        const srcReg = checkGPR(getNextMachineCode())
        setGPR(destReg, getOperationResult(getGPR(destReg) | getGPR(srcReg), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.XOR_REG_WITH_REG: {
        const destReg = checkGPR(getNextMachineCode())
        const srcReg = checkGPR(getNextMachineCode())
        setGPR(destReg, getOperationResult(getGPR(destReg) ^ getGPR(srcReg), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.NOT_REG: {
        const destReg = checkGPR(getNextMachineCode())
        setGPR(destReg, getOperationResult(~getGPR(destReg), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.ROL_REG: {
        const destReg = checkGPR(getNextMachineCode())
        setGPR(
          destReg,
          getOperationResult(
            exp<number>(() => {
              const value = getGPR(destReg)
              const MSB = divide(value, 0x80)
              return (value << 1) + MSB
            }),
            getGPR(destReg)
          )
        )
        incIP()
        break
      }
      case Opcode.ROR_REG: {
        const destReg = checkGPR(getNextMachineCode())
        setGPR(
          destReg,
          getOperationResult(
            exp<number>(() => {
              const value = getGPR(destReg)
              const LSB = modulo(value, 2)
              return LSB * 0x80 + (value >> 1)
            }),
            getGPR(destReg)
          )
        )
        incIP()
        break
      }
      case Opcode.SHL_REG: {
        const destReg = checkGPR(getNextMachineCode())
        setGPR(destReg, getOperationResult(getGPR(destReg) << 1, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.SHR_REG: {
        const destReg = checkGPR(getNextMachineCode())
        setGPR(destReg, getOperationResult(getGPR(destReg) >> 1, getGPR(destReg)))
        incIP()
        break
      }

      // Immediate Arithmetic
      case Opcode.ADD_NUM_TO_REG: {
        const destReg = checkGPR(getNextMachineCode())
        const value = getNextMachineCode()
        setGPR(destReg, getOperationResult(getGPR(destReg) + value, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.SUB_NUM_FROM_REG: {
        const destReg = checkGPR(getNextMachineCode())
        const value = getNextMachineCode()
        setGPR(destReg, getOperationResult(getGPR(destReg) - value, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.MUL_REG_BY_NUM: {
        const destReg = checkGPR(getNextMachineCode())
        const value = getNextMachineCode()
        setGPR(destReg, getOperationResult(getGPR(destReg) * value, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.DIV_REG_BY_NUM: {
        const destReg = checkGPR(getNextMachineCode())
        const value = getNextMachineCode()
        setGPR(destReg, getOperationResult(divide(getGPR(destReg), value), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.MOD_REG_BY_NUM: {
        const destReg = checkGPR(getNextMachineCode())
        const value = getNextMachineCode()
        setGPR(destReg, getOperationResult(modulo(getGPR(destReg), value), getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.AND_REG_WITH_NUM: {
        const destReg = checkGPR(getNextMachineCode())
        const value = getNextMachineCode()
        setGPR(destReg, getOperationResult(getGPR(destReg) & value, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.OR_REG_WITH_NUM: {
        const destReg = checkGPR(getNextMachineCode())
        const value = getNextMachineCode()
        setGPR(destReg, getOperationResult(getGPR(destReg) | value, getGPR(destReg)))
        incIP()
        break
      }
      case Opcode.XOR_REG_WITH_NUM: {
        const destReg = checkGPR(getNextMachineCode())
        const value = getNextMachineCode()
        setGPR(destReg, getOperationResult(getGPR(destReg) ^ value, getGPR(destReg)))
        incIP()
        break
      }

      // Jump
      case Opcode.JMP: {
        const distance = sign8(getNextMachineCode())
        jumpIf(true, distance)
        break
      }
      case Opcode.JZ: {
        const distance = sign8(getNextMachineCode())
        jumpIf(getSR(Flag.Zero), distance)
        break
      }
      case Opcode.JNZ: {
        const distance = sign8(getNextMachineCode())
        jumpIf(!getSR(Flag.Zero), distance)
        break
      }
      case Opcode.JS: {
        const distance = sign8(getNextMachineCode())
        jumpIf(getSR(Flag.Sign), distance)
        break
      }
      case Opcode.JNS: {
        const distance = sign8(getNextMachineCode())
        jumpIf(!getSR(Flag.Sign), distance)
        break
      }
      case Opcode.JO: {
        const distance = sign8(getNextMachineCode())
        jumpIf(getSR(Flag.Overflow), distance)
        break
      }
      case Opcode.JNO: {
        const distance = sign8(getNextMachineCode())
        jumpIf(!getSR(Flag.Overflow), distance)
        break
      }

      // Immediate Move
      case Opcode.MOV_NUM_TO_REG: {
        const destReg = checkGPR(getNextMachineCode())
        const value = getNextMachineCode()
        setGPR(destReg, value)
        incIP()
        break
      }

      // Direct Move
      case Opcode.MOV_ADDR_TO_REG: {
        const destReg = checkGPR(getNextMachineCode())
        const address = getNextMachineCode()
        setGPR(destReg, loadFromMemory(address))
        incIP()
        break
      }
      case Opcode.MOV_REG_TO_ADDR: {
        const address = getNextMachineCode()
        const srcReg = checkGPR(getNextMachineCode())
        storeToMemory(address, getGPR(srcReg))
        incIP()
        break
      }

      // Indirect Move
      case Opcode.MOV_REG_ADDR_TO_REG: {
        const destReg = checkGPR(getNextMachineCode())
        const srcReg = checkGPR(getNextMachineCode())
        setGPR(destReg, loadFromMemory(getGPR(srcReg)))
        incIP()
        break
      }
      case Opcode.MOV_REG_TO_REG_ADDR: {
        const destReg = checkGPR(getNextMachineCode())
        const srcReg = checkGPR(getNextMachineCode())
        storeToMemory(getGPR(destReg), getGPR(srcReg))
        incIP()
        break
      }
    }
  })
