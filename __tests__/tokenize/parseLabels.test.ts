import {
  getCurrentStatementAddress,
  setLabelValue,
  parseLabels
} from '../../src/core/tokenize/parseLabels'
import {
  STATEMENTS,
  STATEMENTS_WITH_LABEL_PARSED,
  STATEMENTS_WITH_LABEL_VALUE,
  LABEL_TUPLES
} from '../constants'

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

describe('parseLabels', () => {
  it('should parse statements to return labels', () => {
    const res = parseLabels(STATEMENTS)
    expect(res.labelTuples).toStrictEqual(LABEL_TUPLES)
    expect(res.statements).toStrictEqual(STATEMENTS_WITH_LABEL_VALUE)
  })
})
