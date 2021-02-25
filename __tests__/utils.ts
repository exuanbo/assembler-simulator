import type { Statement } from '../src/core/tokenize'

export const statementToString = (statement: Statement): string => {
  const { instruction, operands } = statement
  return `${instruction}${
    (operands !== null && ` ${operands.join(', ')}`) || ''
  }`
}

export const expectError = (cb: () => void, msg: string): void => {
  expect.assertions(1)
  try {
    cb()
  } catch (err) {
    expect(err.message).toBe(msg)
  }
}
