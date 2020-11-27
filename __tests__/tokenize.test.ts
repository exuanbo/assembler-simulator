import { tokenize } from '../src/core/tokenize'
import { parseStatements } from '../src/core/tokenize/parseStatements'
import {
  calcAddress,
  calcLabelValueInStatements,
  parseLables
} from '../src/core/tokenize/parseLabels'
import {
  CODE,
  STATEMENTS,
  STATEMENTS_WITH_LABEL_PARSED,
  STATEMENTS_WITH_LABEL_VALUE_CALCULATED,
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
      expect((err as Error).message).toBe('Redundant argument B')
    }
  })
})

describe('calcAddress', () => {
  it('should return the right address', () => {
    const loopAddress = calcAddress(3, STATEMENTS_WITH_LABEL_PARSED)
    expect(loopAddress).toBe(9)

    const finAddress = calcAddress(12, STATEMENTS_WITH_LABEL_PARSED)
    expect(finAddress).toBe(29 + 1)
  })
})

describe('calcLabelValueInStatements', () => {
  it('should calculate labels', () => {
    const res = calcLabelValueInStatements(
      LABEL_TUPLES,
      STATEMENTS_WITH_LABEL_PARSED
    )
    expect(res).toStrictEqual(STATEMENTS_WITH_LABEL_VALUE_CALCULATED)
  })
})

describe('parseLables', () => {
  it('should parse statements to return lables', () => {
    const res = parseLables(STATEMENTS)
    expect(res.labelTuples).toStrictEqual(LABEL_TUPLES)
    expect(res.statements).toStrictEqual(STATEMENTS_WITH_LABEL_VALUE_CALCULATED)
  })
})

describe('tokenize', () => {
  it("should catch error from 'parseStatement'", () => {
    expect.assertions(1)
    try {
      tokenize('mov al, A, B')
    } catch (err) {
      expect((err as Error).message).toBe('Redundant argument B')
    }
  })
})
