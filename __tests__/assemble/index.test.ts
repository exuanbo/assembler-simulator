import { Statement } from '../../src/core/tokenize'
import {
  generateAddressArr,
  generateOpcodesFromStatement,
  assemble
} from '../../src/core/assemble'
import { Instruction } from '../../src/core/constants'
import { statementToString } from '../utils'
import {
  STATEMENTS_WITH_LABEL_VALUE_CALCULATED,
  LABEL_TUPLES
} from '../constants'

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
