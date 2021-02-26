import { tokenize } from '../../src/core/tokenize'

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
