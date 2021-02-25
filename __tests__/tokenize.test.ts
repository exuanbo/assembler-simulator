import { tokenize } from '../src/core/tokenize'
import { parseStatements } from '../src/core/tokenize/parseStatements'
import {
  getCurrentStatementAddress,
  setLabelValue,
  parseLables
} from '../src/core/tokenize/parseLabels'
import {
  CODE,
  STATEMENTS,
  STATEMENTS_WITH_LABEL_PARSED,
  STATEMENTS_WITH_LABEL_VALUE,
  LABEL_TUPLES
} from './constants'

describe('parseStatement', () => {
  it('should parse code to return statements', () => {
    const res = parseStatements(CODE)
    expect(res).toStrictEqual(STATEMENTS)
  })

  it('should throw error', () => {
    expect.assertions(1)
    try {
      parseStatements('mov al, A, B')
    } catch (err) {
      expect((err as Error).message).toBe('Got 3 (> 2) operands')
    }
  })
})

describe('getCurrentStatementAddress', () => {
  it('should return the right address', () => {
    const loopAddress = getCurrentStatementAddress(
      3,
      STATEMENTS_WITH_LABEL_PARSED
    )
    expect(loopAddress).toBe(9)

    const finAddress = getCurrentStatementAddress(
      12,
      STATEMENTS_WITH_LABEL_PARSED
    )
    expect(finAddress).toBe(29 + 1)
  })
})

describe('setLabelValue', () => {
  it('should set label value', () => {
    const res = setLabelValue(LABEL_TUPLES, STATEMENTS_WITH_LABEL_PARSED)
    expect(res).toStrictEqual(STATEMENTS_WITH_LABEL_VALUE)
  })
})

describe('parseLables', () => {
  it('should parse statements to return lables', () => {
    const res = parseLables(STATEMENTS)
    expect(res.labelTuples).toStrictEqual(LABEL_TUPLES)
    expect(res.statements).toStrictEqual(STATEMENTS_WITH_LABEL_VALUE)
  })
})

describe('tokenize', () => {
  it("should catch error from 'parseStatement'", () => {
    expect.assertions(1)
    try {
      tokenize('mov al, A, B')
    } catch (err) {
      expect((err as Error).message).toBe('Got 3 (> 2) operands')
    }
  })
})
