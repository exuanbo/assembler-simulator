import { parseStatements } from './parseStatements'
import { parseLables } from './parseLabels'
import type { Instruction } from '../constants'

export interface StatementWithLabels {
  instruction: string
  operands: [string, string] | [string] | null
}

export interface Statement extends StatementWithLabels {
  instruction: Instruction
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
    statements,
    labelTuples
  }
}
