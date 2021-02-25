import {
  getMovOpcode,
  getArithmeticOpcode,
  getCompareOpcode,
  getOpcode
} from '../../src/core/assemble/getOpcode'
import type {
  ArithmeticInstruction,
  ImmediateArithmeticInstruction
} from '../../src/core/constants'
import {
  Instruction,
  DIRECT_ARITHMETIC_OPCODE_MAP,
  IMMEDIATE_ARITHMETIC_OPCODE_MAP,
  OperandType
} from '../../src/core/constants'
import { expectError } from '../utils'

describe('getMoveOpcode', () => {
  it('should work when MOV register <- number', () => {
    const res = getMovOpcode(
      { type: OperandType.Register, value: 0x00 },
      { type: OperandType.Number, value: 0x01 }
    )
    expect(res).toBe(0xd0)
  })

  it('should work when MOV register <- address', () => {
    const res = getMovOpcode(
      { type: OperandType.Register, value: 0x00 },
      { type: OperandType.Address, value: 0x01 }
    )
    expect(res).toBe(0xd1)
  })

  it('should work when MOV register <- registerPointer', () => {
    const res = getMovOpcode(
      { type: OperandType.Register, value: 0x00 },
      { type: OperandType.RegisterPointer, value: 0x01 }
    )
    expect(res).toBe(0xd3)
  })

  it('should work when MOV address <- register', () => {
    const res = getMovOpcode(
      { type: OperandType.Address, value: 0x00 },
      { type: OperandType.Register, value: 0x01 }
    )
    expect(res).toBe(0xd2)
  })

  it('should work when MOV registerPointer <- register', () => {
    const res = getMovOpcode(
      { type: OperandType.RegisterPointer, value: 0x00 },
      { type: OperandType.Register, value: 0x01 }
    )
    expect(res).toBe(0xd4)
  })

  it('should throw error when MOV number <- register', () => {
    expectError(() => {
      getMovOpcode(
        { type: OperandType.Number, value: 0x00 },
        { type: OperandType.Register, value: 0x01 }
      )
    }, 'The first operand of MOV can not be number, but got 00')
  })

  it('should throw error when MOV register <- register', () => {
    expectError(() => {
      getMovOpcode(
        { type: OperandType.Register, value: 0x00 },
        { type: OperandType.Register, value: 0x01 }
      )
    }, 'The second operand of MOV can not be register, but got BL')
  })

  it('should throw error when MOV address <- number', () => {
    expectError(() => {
      getMovOpcode(
        { type: OperandType.Address, value: 0xc0 },
        { type: OperandType.Number, value: 0x01 }
      )
    }, 'The second operand of MOV must be register, but got 01')
  })
})

describe('getArithmeticOpcode', () => {
  Object.keys(DIRECT_ARITHMETIC_OPCODE_MAP).forEach(instruction => {
    it(`should work with ${instruction} register, register`, () => {
      const res = getArithmeticOpcode(
        instruction as ArithmeticInstruction,
        { type: OperandType.Register, value: 0x00 },
        { type: OperandType.Register, value: 0x01 }
      )
      expect(res).toBe(
        DIRECT_ARITHMETIC_OPCODE_MAP[instruction as ArithmeticInstruction]
      )
    })

    it(`should throw error when '${instruction}' address, number`, () => {
      expectError(() => {
        getArithmeticOpcode(
          instruction as ArithmeticInstruction,
          { type: OperandType.Address, value: 0xc0 },
          { type: OperandType.Number, value: 0x01 }
        )
      }, `The first operand of ${instruction} must be register, but got [C0]`)
    })

    it(`should throw error when '${instruction}' register, address`, () => {
      expectError(() => {
        getArithmeticOpcode(
          instruction as ArithmeticInstruction,
          { type: OperandType.Register, value: 0x00 },
          { type: OperandType.Address, value: 0xc0 }
        )
      }, `The second operand of ${instruction} must be register or number, but got [C0]`)
    })
  })

  Object.keys(IMMEDIATE_ARITHMETIC_OPCODE_MAP).forEach(instruction => {
    it(`should work with ${instruction} register, number`, () => {
      const res = getArithmeticOpcode(
        instruction as ImmediateArithmeticInstruction,
        { type: OperandType.Register, value: 0x00 },
        { type: OperandType.Number, value: 0x01 }
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
      { type: OperandType.Register, value: 0x00 },
      { type: OperandType.Register, value: 0x01 }
    )
    expect(res).toBe(0xda)
  })

  it('should work when CMP register, address', () => {
    const res = getCompareOpcode(
      { type: OperandType.Register, value: 0x00 },
      { type: OperandType.Address, value: 0x01 }
    )
    expect(res).toBe(0xdc)
  })

  it('should work when CMP register, number', () => {
    const res = getCompareOpcode(
      { type: OperandType.Register, value: 0x00 },
      { type: OperandType.Number, value: 0x01 }
    )
    expect(res).toBe(0xdb)
  })

  it('should throw error when CMP address, register ', () => {
    expectError(() => {
      getCompareOpcode(
        { type: OperandType.Address, value: 0xc0 },
        { type: OperandType.Register, value: 0x00 }
      )
    }, 'The first operand of CMP must be register, but got [C0]')
  })

  it('should throw error when CMP register, [register] ', () => {
    expectError(() => {
      getCompareOpcode(
        { type: OperandType.Register, value: 0x00 },
        { type: OperandType.RegisterPointer, value: 0x01 }
      )
    }, 'The second operand of CMP can not be address with register, but got [BL]')
  })
})

describe('getOpcode', () => {
  it('should return correct opcode with MOV', () => {
    const res = getOpcode(
      Instruction.MOV,
      { type: OperandType.Register, value: 0x00 },
      { type: OperandType.Number, value: 0x01 }
    )
    expect(res).toBe(0xd0)
  })

  it('should return correct opcode with ADD', () => {
    const res = getOpcode(
      Instruction.ADD,
      { type: OperandType.Register, value: 0x00 },
      { type: OperandType.Number, value: 0x01 }
    )
    expect(res).toBe(0xb0)
  })

  it('should return correct opcode with INC', () => {
    const res = getOpcode(Instruction.INC, {
      type: OperandType.Register,
      value: 0x00
    })
    expect(res).toBe(0xa4)
  })

  it('should return correct opcode with CMP', () => {
    const res = getOpcode(
      Instruction.CMP,
      { type: OperandType.Register, value: 0x00 },
      { type: OperandType.Register, value: 0x01 }
    )
    expect(res).toBe(0xda)
  })

  it('should return correct opcode with JMP', () => {
    const res = getOpcode(Instruction.JMP, {
      type: OperandType.Number,
      value: 0x01
    })
    expect(res).toBe(0xc0)
  })
})
