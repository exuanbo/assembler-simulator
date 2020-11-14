import { ARGS_COUNT } from '../constants'

type ExcludesUndefined = <T>(s: T | undefined) => s is T

export interface Label {
  [name: string]: number
}

type Keyword = keyof typeof ARGS_COUNT

export interface Statement {
  key: Keyword | string
  args: string[] | null | undefined
}

interface TokenizeResult {
  labels: Label
  statements: Statement[]
}

export const parseStatement = (code: string): Statement[] =>
  code
    .split('\n')
    .map((stmt: string): Statement | undefined => {
      if (stmt.length === 0) {
        return undefined
      }

      const statement = stmt.replace(/\s*;.*/, '')

      if (statement.endsWith(':')) {
        return { key: statement.slice(0, -1), args: undefined }
      }

      const firstWhitespacePos = statement.search(/\s/)
      if (firstWhitespacePos < 0) {
        return { key: statement, args: null }
      }

      const keyword = statement.slice(0, firstWhitespacePos).toUpperCase()
      const args = statement.slice(firstWhitespacePos).replace(/\s/g, '')

      const commaPos = args.search(/,/)
      if (commaPos > 0) {
        return { key: keyword, args: args.split(',') }
      }

      return { key: keyword, args: [args] }
    })
    .filter((Boolean as unknown) as ExcludesUndefined)

export const parseLables = (statements: Statement[]): Array<[string, number]> =>
  statements
    .map((stmt: Statement, index: number): [string, number] | undefined => {
      if (stmt.args === undefined) {
        return [stmt.key, index]
      }
      return undefined
    })
    .filter((Boolean as unknown) as ExcludesUndefined)

export const tokenize = (code: string): TokenizeResult => {
  const statements = parseStatement(code)

  const lablesArr = parseLables(statements)
  const labels = Object.fromEntries(lablesArr) as Label

  return {
    labels,
    statements
  }
}
