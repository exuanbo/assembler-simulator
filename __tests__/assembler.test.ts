import { Statement } from '../src/core/tokenize'
import {
  generateAddressArr,
  getMovOpcode,
  getArithmeticOpcode,
  getCompareOpcode,
  getOpcode,
  generateOpcodesFromStatement,
  assemble
} from '../src/core/assembler'
import {
  Instruction,
  ArithmeticInstruction,
  DIRECT_ARITHMETIC_OPCODE_MAP,
  ImmediateArithmeticInstruction,
  IMMEDIATE_ARITHMETIC_OPCODE_MAP,
  ArgType
} from '../src/core/constants'
import { statementToString, expectError } from './utils'
import {
  STATEMENTS_WITH_LABEL_VALUE_CALCULATED,
  LABEL_TUPLES
} from './constants'

describe('generateAddressArr', () => {
  it('should generate address array', () => {
    const res = generateAddressArr(false)
    expect(res.length).toBe(0x100)
    expect(res[0xc0]).toBe(0x00)
  })

  it('should generate address array with VDU initialized', () => {
    const res = generateAddressArr(true)
    expect(res.length).toBe(0x100)
    expect(res[0xc0]).toBe(0x20)
    expect(res[0xff]).toBe(0x20)
  })
})

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

const statementOpcodes = [
  [0xd0, 0x03, 0x0a],
  [0xd0, 0x00, 0x00],
  [0xd0, 0x01, 0xc0],
  [0xb0, 0x00, 0x30],
  [0xd4, 0x01, 0x00],
  [0xb1, 0x00, 0x30],
  [0xa4, 0x00],
  [0xa4, 0x01],
  [0xda, 0x00, 0x03],
  [0xc1, 0x04],
  [0xc0, 0xee],
  [0x00]
]

const statementsWithIllegalArgs: Statement[] = [
  { instruction: Instruction.MOV, args: ['ALL', 'BL'] },
  { instruction: Instruction.ADD, args: ['AL', 'BLL'] },
  { instruction: Instruction.INC, args: ['ABC'] }
]

describe('generateOpcodesFromStatements', () => {
  STATEMENTS_WITH_LABEL_VALUE_CALCULATED.forEach((statement, index) => {
    it(`should work with '${statementToString(
      statement
    )}' on line ${index}`, () => {
      const res = generateOpcodesFromStatement(statement)
      expect(res).toStrictEqual(statementOpcodes[index])
    })
  })

  statementsWithIllegalArgs.forEach((statement, index) => {
    const { args } = statement
    it(`should throw an error with '${statementToString(statement)}'`, () => {
      expect.assertions(1)
      try {
        generateOpcodesFromStatement(statement)
      } catch (err) {
        expect(err.message).toBe(
          `Invalid argument ${(args as string[])[index > 1 ? 0 : index]}`
        )
      }
    })
  })

  it('should return 0 if instruction is END', () => {
    const res = generateOpcodesFromStatement({
      instruction: Instruction.END,
      args: undefined
    })
    expect(res).toStrictEqual([0])
  })
})

// eslint-disable-next-line prettier/prettier
const assembledAddress = [0xd0, 0x03, 0x0a, 0xd0, 0, 0, 0xd0, 0x01, 0xc0, 0xb0, 0, 0x30, 0xd4, 0x01, 0, 0xb1, 0, 0x30, 0xa4, 0, 0xa4, 0x01, 0xda, 0, 0x03, 0xc1, 0x04, 0xc0, 0xee, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20]

describe('assemble', () => {
  STATEMENTS_WITH_LABEL_VALUE_CALCULATED.forEach((statement, index) => {
    it(`should assemble single line '${statementToString(statement)}'`, () => {
      const address = assemble({ statements: [statement], labelTuples: [] })
      const opcodes = statementOpcodes[index] as number[]
      expect(Array.from(address.slice(0, opcodes.length))).toEqual(opcodes)
    })
  })

  it('should assemble code', () => {
    const address = assemble({
      statements: STATEMENTS_WITH_LABEL_VALUE_CALCULATED,
      labelTuples: LABEL_TUPLES
    })
    expect(Array.from(address)).toEqual(assembledAddress)
  })
})
