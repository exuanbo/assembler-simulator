import { produce } from 'immer'
import {
  InvalidRegisterError,
  RunBeyondEndOfMemory,
  // StackOverflowError,
  // StackUnderflowError,
  DivideByZeroError
} from '../../common/exceptions'
import { Opcode, Register } from '../../common/constants'
import { Head, unsign8bit, exp } from '../../common/utils'

type GPR = [AL: number, BL: number, CL: number, DL: number]

const MAX_SP = 0xbf

enum Flag {
  Zero,
  Overflow,
  Sign,
  Interrupt
}

type SR = [zero: boolean, overflow: boolean, sign: boolean, interrupt: boolean]

interface CPU {
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

const checkOperationResult = (
  result: number,
  previousValue: number
): [result: number, flags: Partial<SR>] => {
  const finalResult = result > 0xff ? result % 0x100 : unsign8bit(result)
  const flags: Head<SR> = [false, false, false]
  if (finalResult === 0) {
    flags[Flag.Zero] = true
  } else if (finalResult >= 0x80) {
    flags[Flag.Sign] = true
  }
  if (
    /* addition */ (previousValue < 0x80 && result >= 0x80) ||
    /* subtraction */ (previousValue >= 0x80 && result < 0x80)
  ) {
    flags[Flag.Overflow] = true
  }
  return [finalResult, flags]
}

export const step = (__cpu: CPU, __memory: number[]): [cpu: CPU, memory: number[]] =>
  produce([__cpu, __memory], ([cpu, memory]) => {
    const getGPR = (register: Register): number => cpu.gpr[register]
    const setGPR = (register: Register, value: number): void => {
      cpu.gpr[register] = value
    }

    const setIP = (address: number): void => {
      cpu.ip = address
    }
    const incIP = (): void => {
      setIP(checkIP(cpu.ip + 1))
    }

    const setSR = (flags: Partial<SR>): void => {
      Object.assign(cpu.sr, flags)
    }

    const loadFromMemory = (address: number): number => {
      return memory[address]
    }
    // const storeToMemory = (address: number, machineCode: number): void => {
    //   memory[address] = machineCode
    // }

    /**
     * @modifies {@link cpu.ip}
     */
    const getNextOpcode = (): number => {
      incIP()
      return loadFromMemory(cpu.ip)
    }

    const opcode = loadFromMemory(cpu.ip)

    switch (opcode) {
      case Opcode.END:
        cpu.isHalted = true
        break
      case Opcode.ADD_REG_TO_REG: {
        const destReg = checkGPR(getNextOpcode())
        const srcReg = checkGPR(getNextOpcode())
        const [result, flags] = checkOperationResult(
          getGPR(destReg) + getGPR(srcReg),
          getGPR(destReg)
        )
        setGPR(destReg, result)
        setSR(flags)
        incIP()
        break
      }
      case Opcode.SUB_REG_FROM_REG: {
        const destReg = checkGPR(getNextOpcode())
        const srcReg = checkGPR(getNextOpcode())
        const [result, flags] = checkOperationResult(
          getGPR(destReg) - getGPR(srcReg),
          getGPR(destReg)
        )
        setGPR(destReg, result)
        setSR(flags)
        incIP()
        break
      }
      case Opcode.MUL_REG_BY_REG: {
        const destReg = checkGPR(getNextOpcode())
        const srcReg = checkGPR(getNextOpcode())
        const [result, flags] = checkOperationResult(
          getGPR(destReg) * getGPR(srcReg),
          getGPR(destReg)
        )
        setGPR(destReg, result)
        setSR(flags)
        incIP()
        break
      }
      case Opcode.DIV_REG_BY_REG: {
        const destReg = checkGPR(getNextOpcode())
        const srcReg = checkGPR(getNextOpcode())
        const [result, flags] = checkOperationResult(
          exp<number>(() => {
            const divisor = getGPR(srcReg)
            if (divisor === 0) {
              throw new DivideByZeroError()
            }
            return Math.floor(getGPR(destReg) / divisor)
          }),
          getGPR(destReg)
        )
        setGPR(destReg, result)
        setSR(flags)
        incIP()
        break
      }
      case Opcode.INC_REG: {
        const destReg = checkGPR(getNextOpcode())
        const [result, flags] = checkOperationResult(getGPR(destReg) + 1, getGPR(destReg))
        setGPR(destReg, result)
        setSR(flags)
        incIP()
        break
      }
      case Opcode.DEC_REG: {
        const destReg = checkGPR(getNextOpcode())
        const [result, flags] = checkOperationResult(getGPR(destReg) - 1, getGPR(destReg))
        setGPR(destReg, result)
        setSR(flags)
        incIP()
        break
      }
      case Opcode.MOD_REG_BY_REG: {
        const destReg = checkGPR(getNextOpcode())
        const srcReg = checkGPR(getNextOpcode())
        const [result, flags] = checkOperationResult(
          exp<number>(() => {
            const divisor = getGPR(srcReg)
            if (divisor === 0) {
              throw new DivideByZeroError()
            }
            return getGPR(destReg) % divisor
          }),
          getGPR(destReg)
        )
        setGPR(destReg, result)
        setSR(flags)
        incIP()
        break
      }
      case Opcode.AND_REG_WITH_REG: {
        const destReg = checkGPR(getNextOpcode())
        const srcReg = checkGPR(getNextOpcode())
        const [result, flags] = checkOperationResult(
          getGPR(destReg) & getGPR(srcReg),
          getGPR(destReg)
        )
        setGPR(destReg, result)
        setSR(flags)
        incIP()
        break
      }
      case Opcode.OR_REG_WITH_REG: {
        const destReg = checkGPR(getNextOpcode())
        const srcReg = checkGPR(getNextOpcode())
        const [result, flags] = checkOperationResult(
          getGPR(destReg) | getGPR(srcReg),
          getGPR(destReg)
        )
        setGPR(destReg, result)
        setSR(flags)
        incIP()
        break
      }
      case Opcode.XOR_REG_WITH_REG: {
        const destReg = checkGPR(getNextOpcode())
        const srcReg = checkGPR(getNextOpcode())
        const [result, flags] = checkOperationResult(
          getGPR(destReg) ^ getGPR(srcReg),
          getGPR(destReg)
        )
        setGPR(destReg, result)
        setSR(flags)
        incIP()
        break
      }
      case Opcode.NOT_REG: {
        const destReg = checkGPR(getNextOpcode())
        const [result, flags] = checkOperationResult(~getGPR(destReg), getGPR(destReg))
        setGPR(destReg, result)
        setSR(flags)
        incIP()
        break
      }
      case Opcode.ROL_REG: {
        const destReg = checkGPR(getNextOpcode())
        const [result, flags] = checkOperationResult(
          exp<number>(() => {
            const value = getGPR(destReg)
            const MSB = Math.floor(value / 0x80)
            return (value << 1) + MSB
          }),
          getGPR(destReg)
        )
        setGPR(destReg, result)
        setSR(flags)
        incIP()
        break
      }
      case Opcode.ROR_REG: {
        const destReg = checkGPR(getNextOpcode())
        const [result, flags] = checkOperationResult(
          exp<number>(() => {
            const value = getGPR(destReg)
            const LSB = value % 2
            return LSB * 0x80 + (value >> 1)
          }),
          getGPR(destReg)
        )
        setGPR(destReg, result)
        setSR(flags)
        incIP()
        break
      }
      case Opcode.SHL_REG: {
        const destReg = checkGPR(getNextOpcode())
        const [result, flags] = checkOperationResult(getGPR(destReg) << 1, getGPR(destReg))
        setGPR(destReg, result)
        setSR(flags)
        incIP()
        break
      }
      case Opcode.SHR_REG: {
        const destReg = checkGPR(getNextOpcode())
        const [result, flags] = checkOperationResult(getGPR(destReg) >> 1, getGPR(destReg))
        setGPR(destReg, result)
        setSR(flags)
        incIP()
        break
      }
    }
  })
