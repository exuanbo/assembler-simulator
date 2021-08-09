import { produce } from 'immer'
import { InvalidRegisterError } from '../../common/exceptions'
import { Opcode, Register } from '../../common/constants'

type GPR = [AL: number, BL: number, CL: number, DL: number]

type SR = {
  [flagName in 'zero' | 'overflow' | 'sign' | 'interrupt']: boolean
}

interface CPU {
  gpr: GPR
  ip: number
  sp: number
  sr: SR
  isHalted: boolean
}

export const initCPU = (): CPU => {
  return {
    gpr: [0, 0, 0, 0],
    ip: 0,
    sp: 0xbf,
    sr: {
      zero: false,
      overflow: false,
      sign: false,
      interrupt: false
    },
    isHalted: false
  }
}

const checkGPR = (value: number): Register => {
  if (value < 0 || value >= 4) {
    throw new InvalidRegisterError(value)
  }
  return value
}

const checkOperation = (
  result: number,
  previousValue: number
): [result: number, flags: Partial<SR>] => {
  const flags = {
    zero: false,
    overflow: false,
    sign: false
  }
  if (result > 0xff) {
    result %= 0x100
  } else if (result < 0) {
    result += 0x100
  }
  if (result === 0) {
    flags.zero = true
  } else if (result >= 0x80) {
    flags.sign = true
  }
  if ((previousValue < 0x80 && result >= 0x80) || (previousValue >= 0x80 && result < 0x80)) {
    flags.overflow = true
  }
  return [result, flags]
}

export const step = (__cpu: CPU, __memory: number[]): [cpu: CPU, memory: number[]] =>
  produce([__cpu, __memory], ([cpu, memory]) => {
    const getGPR = (register: Register): number => cpu.gpr[register]
    const setGPR = (register: Register, value: number): void => {
      cpu.gpr[register] = value
    }
    const incIP = (value: number): void => {
      cpu.ip += value
    }
    // const setIP = (address: number): void => {
    //   cpu.ip = address
    // }
    const setSR = (flags: Partial<SR>): void => {
      Object.assign(cpu.sr, flags)
    }

    const loadFromMemory = (address: number): number => memory[address]
    // const storeToMemory = (address: number, machineCode: number): void => {
    //   memory[address] = machineCode
    // }

    const opcode = loadFromMemory(cpu.ip)

    switch (opcode) {
      case Opcode.END:
        cpu.isHalted = true
        break
      case Opcode.ADD_REG_TO_REG: {
        const destReg = checkGPR(loadFromMemory(cpu.ip + 1))
        const srcReg = checkGPR(loadFromMemory(cpu.ip + 2))
        const [result, flags] = checkOperation(getGPR(destReg) + getGPR(srcReg), getGPR(destReg))
        setGPR(destReg, result)
        setSR(flags)
        incIP(3)
        break
      }
    }
  })
