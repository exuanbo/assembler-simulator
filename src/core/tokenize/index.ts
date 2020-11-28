import { parseStatements } from './parseStatements'
import { parseLables } from './parseLabels'
import { Instruction } from '../constants'

interface StatementWithoutInstruction {
  args: [string, string] | [string] | undefined
}

export interface StatementWithLabels extends StatementWithoutInstruction {
  instruction: string
}

export interface Statement extends StatementWithoutInstruction {
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
