import { Statement } from '../src/core/tokenize'

export const statementToString = (statement: Statement): string => {
  const { key, args } = statement
  return `${key}${(args !== undefined && ` ${args.join(', ')}`) || ''}`
}
