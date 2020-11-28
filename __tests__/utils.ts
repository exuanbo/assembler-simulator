import { Statement } from '../src/core/tokenize'

export const statementToString = (statement: Statement): string => {
  const { instruction, args } = statement
  return `${instruction}${(args !== undefined && ` ${args.join(', ')}`) || ''}`
}

export const expectError = (cb: () => void, msg: string): void => {
  expect.assertions(1)
  try {
    cb()
  } catch (err) {
    expect(err.message).toBe(msg)
  }
}
