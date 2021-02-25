import { generateAddressArr, assemble } from '../../src/core/assemble'
import { statementToString } from '../utils'
import {
  STATEMENTS_WITH_LABEL_VALUE,
  STATEMENTS_OPCODES,
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
