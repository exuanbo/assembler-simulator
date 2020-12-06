import {
  getMovOpcode,
  getArithmeticOpcode,
  getCompareOpcode,
  getOpcode
} from '../../src/core/assemble/getOpcode'
import {
  Instruction,
  ArithmeticInstruction,
  DIRECT_ARITHMETIC_OPCODE_MAP,
  ImmediateArithmeticInstruction,
  IMMEDIATE_ARITHMETIC_OPCODE_MAP,
  ArgType
} from '../../src/core/constants'
import { expectError } from '../utils'

describe('getMoveOpcode', () => {
  it('should work when MOV register <- number', () => {
    const res = getMovOpcode(
      { type: ArgType.Register, value: 0x00 },
      { type: ArgType.Number, value: 0x01 }
    )
    expect(res).toBe(0xd0)
  })

  it('should work when MOV register <- address', () => {
    const res = getMovOpcode(
      { type: ArgType.Register, value: 0x00 },
      { type: ArgType.Address, value: 0x01 }
    )
    expect(res).toBe(0xd1)
  })

  it('should work when MOV register <- registerPointer', () => {
    const res = getMovOpcode(
      { type: ArgType.Register, value: 0x00 },
      { type: ArgType.RegisterPointer, value: 0x01 }
    )
    expect(res).toBe(0xd3)
  })

  it('should work when MOV address <- register', () => {
    const res = getMovOpcode(
      { type: ArgType.Address, value: 0x00 },
      { type: ArgType.Register, value: 0x01 }
    )
    expect(res).toBe(0xd2)
  })

  it('should work when MOV registerPointer <- register', () => {
    const res = getMovOpcode(
      { type: ArgType.RegisterPointer, value: 0x00 },
      { type: ArgType.Register, value: 0x01 }
    )
    expect(res).toBe(0xd4)
  })

  it('should throw error when MOV number <- register', () => {
    expectError(() => {
      getMovOpcode(
        { type: ArgType.Number, value: 0x00 },
        { type: ArgType.Register, value: 0x01 }
      )
    }, 'The first argument of MOV can not be number. Got 00')
  })

  it('should throw error when MOV register <- register', () => {
    expectError(() => {
      getMovOpcode(
        { type: ArgType.Register, value: 0x00 },
        { type: ArgType.Register, value: 0x01 }
      )
    }, 'The second argument of MOV can not be register. Got BL')
  })

  it('should throw error when MOV address <- number', () => {
    expectError(() => {
      getMovOpcode(
        { type: ArgType.Address, value: 0xc0 },
        { type: ArgType.Number, value: 0x01 }
      )
    }, 'The second argument of MOV must be register. Got 01')
  })
})

describe('getArithmeticOpcode', () => {
  Object.keys(DIRECT_ARITHMETIC_OPCODE_MAP).forEach(instruction => {
    it(`should work with ${instruction} register, register`, () => {
      const res = getArithmeticOpcode(
        instruction as ArithmeticInstruction,
        { type: ArgType.Register, value: 0x00 },
        { type: ArgType.Register, value: 0x01 }
      )
      expect(res).toBe(
        DIRECT_ARITHMETIC_OPCODE_MAP[instruction as ArithmeticInstruction]
      )
    })

    it(`should throw error when '${instruction}' address, number`, () => {
      expectError(() => {
        getArithmeticOpcode(
          instruction as ArithmeticInstruction,
          { type: ArgType.Address, value: 0xc0 },
          { type: ArgType.Number, value: 0x01 }
        )
      }, `The first argument of ${instruction} must be register. Got [C0]`)
    })

    it(`should throw error when '${instruction}' register, address`, () => {
      expectError(() => {
        getArithmeticOpcode(
          instruction as ArithmeticInstruction,
          { type: ArgType.Register, value: 0x00 },
          { type: ArgType.Address, value: 0xc0 }
        )
      }, `The second argument of ${instruction} must be register or number. Got [C0]`)
    })
  })

  Object.keys(IMMEDIATE_ARITHMETIC_OPCODE_MAP).forEach(instruction => {
    it(`should work with ${instruction} register, number`, () => {
      const res = getArithmeticOpcode(
        instruction as ImmediateArithmeticInstruction,
        { type: ArgType.Register, value: 0x00 },
        { type: ArgType.Number, value: 0x01 }
      )
      expect(res).toBe(
        IMMEDIATE_ARITHMETIC_OPCODE_MAP[
          instruction as ImmediateArithmeticInstruction
        ]
      )
    })
  })
})

describe('getCompareOpcode', () => {
  it('should work when CMP register, register', () => {
    const res = getCompareOpcode(
      { type: ArgType.Register, value: 0x00 },
      { type: ArgType.Register, value: 0x01 }
    )
    expect(res).toBe(0xda)
  })

  it('should work when CMP register, address', () => {
    const res = getCompareOpcode(
      { type: ArgType.Register, value: 0x00 },
      { type: ArgType.Address, value: 0x01 }
    )
    expect(res).toBe(0xdc)
  })

  it('should work when CMP register, number', () => {
    const res = getCompareOpcode(
      { type: ArgType.Register, value: 0x00 },
      { type: ArgType.Number, value: 0x01 }
    )
    expect(res).toBe(0xdb)
  })

  it('should throw error when CMP address, register ', () => {
    expectError(() => {
      getCompareOpcode(
        { type: ArgType.Address, value: 0xc0 },
        { type: ArgType.Register, value: 0x00 }
      )
    }, 'The first argument of CMP must be register. Got [C0]')
  })

  it('should throw error when CMP register, [register] ', () => {
    expectError(() => {
      getCompareOpcode(
        { type: ArgType.Register, value: 0x00 },
        { type: ArgType.RegisterPointer, value: 0x01 }
      )
    }, 'The second argument of CMP can not be address with register. Got [BL]')
  })
})

describe('getOpcode', () => {
  it('should return correct opcode with MOV', () => {
    const res = getOpcode(
      Instruction.MOV,
      { type: ArgType.Register, value: 0x00 },
      { type: ArgType.Number, value: 0x01 }
    )
    expect(res).toBe(0xd0)
  })

  it('should return correct opcode with ADD', () => {
    const res = getOpcode(
      Instruction.ADD,
      { type: ArgType.Register, value: 0x00 },
      { type: ArgType.Number, value: 0x01 }
    )
    expect(res).toBe(0xb0)
  })

  it('should return correct opcode with INC', () => {
    const res = getOpcode(Instruction.INC, {
      type: ArgType.Register,
      value: 0x00
    })
    expect(res).toBe(0xa4)
  })

  it('should return correct opcode with CMP', () => {
    const res = getOpcode(
      Instruction.CMP,
      { type: ArgType.Register, value: 0x00 },
      { type: ArgType.Register, value: 0x01 }
    )
    expect(res).toBe(0xda)
  })

  it('should return correct opcode with JMP', () => {
    const res = getOpcode(Instruction.JMP, {
      type: ArgType.Number,
      value: 0x01
    })
    expect(res).toBe(0xc0)
  })
})
