import { parseStatements } from '../../src/core/tokenize/parseStatements'
import { CODE, STATEMENTS } from '../constants'

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
