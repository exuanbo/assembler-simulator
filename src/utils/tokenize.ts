const excludeUndefined = <T>(item: T | undefined): item is T => Boolean(item)

export interface Statement {
  key: string
  args: [string, string] | [string] | null | undefined
}

export const parseStatement = (code: string): Statement[] =>
  code
    .split('\n')
    .map((stmt: string): Statement | undefined => {
      if (stmt.length === 0) {
        return undefined
      }

      const statement = stmt.replace(/\s*;.*/, '').toUpperCase()

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
        const splitArgs = args.split(',')
        if (splitArgs.length > 2) {
          throw new Error(
            `Redundant arguments '${splitArgs.splice(2).join(', ')}'`
          )
        }
        return { key: keyword, args: splitArgs as [string, string] }
      }

      return { key: keyword, args: [args] }
    })
    .filter(excludeUndefined)

export const parseLables = (statements: Statement[]): Array<[string, number]> =>
  statements
    .map((stmt: Statement, index: number): [string, number] | undefined => {
      if (stmt.args === undefined) {
        return [stmt.key, index]
      }
      return undefined
    })
    .filter(excludeUndefined)

export interface Label {
  [name: string]: number
}

interface TokenizeResult {
  labels: Label
  statements: Statement[]
}

export const tokenize = (code: string): TokenizeResult => {
  try {
    const statements = parseStatement(code)

    const lablesArr = parseLables(statements)
    const labels = Object.fromEntries(lablesArr) as Label

    return {
      labels,
      statements
    }
  } catch (err) {
    throw new Error(`Failed to tokenize: ${(err as Error).message}`)
  }
}
