import { parseStatements } from './parseStatements'
import { parseLables } from './parseLabels'

export interface Statement {
  key: string
  args: [string, string] | [string] | undefined
}

/**
 * [name, address]
 */
export type LabelTuple = [string, number]

export interface TokenizeResult {
  statements: Statement[]
  labelTuples: LabelTuple[]
}

export const tokenize = (code: string): TokenizeResult | never => {
  const { statements, labelTuples } = parseLables(parseStatements(code))

  return {
    labelTuples,
    statements
  }
}
