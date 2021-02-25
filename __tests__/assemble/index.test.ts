import {
  generateAddressArr,
  getOpcodesFromStatemet,
  assemble
} from '../../src/core/assemble'
import { Instruction } from '../../src/core/constants'
import { statementToString } from '../utils'
import {
  STATEMENTS_WITH_LABEL_VALUE,
  STATEMENTS_OPCODES,
  STATEMENTS_WITH_ILLEGAL_OPERANDS,
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

describe('getOpcodesFromStatemet', () => {
  STATEMENTS_WITH_LABEL_VALUE.forEach((statement, index) => {
    it(`should work with '${statementToString(
      statement
    )}' on line ${index}`, () => {
      const res = getOpcodesFromStatemet(statement)
      expect(res).toStrictEqual(STATEMENTS_OPCODES[index])
    })
  })

  STATEMENTS_WITH_ILLEGAL_OPERANDS.forEach((statement, index) => {
    const { operands } = statement
    it(`should throw an error with '${statementToString(statement)}'`, () => {
      expect.assertions(1)
      try {
        getOpcodesFromStatemet(statement)
      } catch (err) {
        expect(err.message).toBe(
          `Invalid operand ${operands?.[index > 1 ? 0 : index]}`
        )
      }
    })
  })

  it('should return 0 if instruction is END', () => {
    const res = getOpcodesFromStatemet({
      instruction: Instruction.END,
      operands: null
    })
    expect(res).toStrictEqual([0])
  })
})

// eslint-disable-next-line prettier/prettier
const assembledAddress = [0xd0, 0x03, 0x0a, 0xd0, 0, 0, 0xd0, 0x01, 0xc0, 0xb0, 0, 0x30, 0xd4, 0x01, 0, 0xb1, 0, 0x30, 0xa4, 0, 0xa4, 0x01, 0xda, 0, 0x03, 0xc1, 0x04, 0xc0, 0xee, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20]

describe('assemble', () => {
  STATEMENTS_WITH_LABEL_VALUE.forEach((statement, index) => {
    it(`should assemble single line '${statementToString(statement)}'`, () => {
      const address = assemble({ statements: [statement], labelTuples: [] })
      const opcodes = STATEMENTS_OPCODES[index]
      expect(Array.from(address.slice(0, opcodes.length))).toEqual(opcodes)
    })
  })

  it('should assemble code', () => {
    const address = assemble({
      statements: STATEMENTS_WITH_LABEL_VALUE,
      labelTuples: LABEL_TUPLES
    })
    expect(Array.from(address)).toEqual(assembledAddress)
  })
})
