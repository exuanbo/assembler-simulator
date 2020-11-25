import { excludeUndefined, decToHex } from './helper'
import { JumpKeyword } from './constants'

export interface Statement {
  key: string
  args: [string, string] | [string] | undefined
}

export const parseStatements = (code: string): Statement[] | never =>
  code
    .split('\n')
    .map((stmt: string): Statement | undefined => {
      const statement = stmt.replace(/;.*/, '').trim().toUpperCase()

      if (statement.length === 0) {
        return undefined
      }

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
          const rest = splitArgs.splice(2)
          throw new Error(
            `Redundant argument${rest.length > 1 ? 's' : ''} '${rest.join(
              ', '
            )}'`
          )
        }
        return { key: keyword, args: splitArgs as [string, string] }
      }

      return { key: keyword, args: [args] }
    })
    .filter(excludeUndefined)

/**
 * [name, address]
 */
export type LabelTuple = [string, number]

export interface TokenizeResult {
  statements: Statement[]
  labelTuples: LabelTuple[]
}

const isLabel = (statement: Statement): boolean =>
  statement.key.endsWith(':') && statement.args === undefined

export const calcAddress = (statements: Statement[], index: number): number =>
  statements
    .slice(0, index)
    .map(s => (s.args?.length ?? 0) + 1)
    .reduce((acc, cur) => acc + cur)

export const parseLables = (statements: Statement[]): TokenizeResult => {
  let labelsCount = 0

  const labelTuples = statements
    .map((statement, index): LabelTuple | undefined => {
      if (isLabel(statement)) {
        const labelAddress = calcAddress(statements, index) - labelsCount
        labelsCount++
        return [statement.key.slice(0, -1), labelAddress]
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

export const calcLabels = ({
  statements,
  labelTuples
}: TokenizeResult): TokenizeResult => {
  const newStatements = statements.map((statement, index) => {
    labelTuples.forEach(([label, labelAddress]) => {
      const { key, args } = statement
      if (key in JumpKeyword && args?.length === 1 && args[0] === label) {
        const statementAddress = calcAddress(statements, index)
        const relDistance = labelAddress - statementAddress
        const absDistance = relDistance > 0 ? relDistance : 0x100 + relDistance
        const labelValue = decToHex(absDistance)
        statement.args = [labelValue]
      }
      return undefined
    })
    return statement
  })

  return {
    labelTuples,
    statements: newStatements
  }
}

export const tokenize = (code: string): TokenizeResult | never => {
  try {
    const { statements, labelTuples } = calcLabels(
      parseLables(parseStatements(code))
    )
    return {
      labelTuples,
      statements
    }
  } catch (err) {
    throw new Error(`Tokenize failed: ${(err as Error).message}`)
  }
}
