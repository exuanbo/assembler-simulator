import excludeUndefined from './excludeUndefined'
import { JUMP_KEYWORDS } from './constants'
export interface Statement {
  key: string
  args: [string, string] | [string] | undefined
}

export const parseStatements = (code: string): Statement[] =>
  code
    .split('\n')
    .map((stmt: string): Statement | undefined => {
      if (stmt.length === 0) {
        return undefined
      }

      const statement = stmt.replace(/\s*;.*/, '').toUpperCase()

      const firstWhitespacePos = statement.search(/\s/)
      if (firstWhitespacePos < 0) {
        return { key: statement, args: undefined }
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

interface Result {
  statements: Statement[]
}

interface ParseLablesResult extends Result {
  labelTuples: Array<[string, number]>
}

export const parseLables = (statements: Statement[]): ParseLablesResult => {
  const isLabel = (statement: Statement): boolean =>
    statement.key.endsWith(':') && statement.args === undefined

  let labelsCount = 0

  const labelTuples = statements
    .map((statement, index): [string, number] | undefined => {
      if (isLabel(statement)) {
        labelsCount++
        return [statement.key.slice(0, -1), index - labelsCount + 1]
      }
      return undefined
    })
    .filter(excludeUndefined)

  const filteredStatements = statements
    .map(statement => (isLabel(statement) ? undefined : statement))
    .filter(excludeUndefined)

  return {
    labelTuples,
    statements: filteredStatements
  }
}

export interface Labels {
  [name: string]: number
}

export const calcLabels = (
  statements: Statement[],
  lables: Labels
): Statement[] =>
  statements.map((statement, index) => {
    Object.entries(lables).forEach(([label, position]) => {
      const { key, args } = statement
      if (key in JUMP_KEYWORDS && args?.length === 1 && args[0] === label) {
        statement.args = [(position - index).toString(16)]
      }
    })
    return statement
  })

interface TokenizeResult extends Result {
  labels: Labels
}

export const tokenize = (code: string): TokenizeResult => {
  try {
    const parseResult = parseLables(parseStatements(code))
    const labels = Object.fromEntries(parseResult.labelTuples)
    const statements = calcLabels(parseResult.statements, labels)

    return {
      labels,
      statements
    }
  } catch (err) {
    throw new Error(`Failed to tokenize: ${(err as Error).message}`)
  }
}
