import { parseStatements } from './parseStatements'
import { parseLabels } from './parseLabels'
import type { Instruction } from '../constants'

export interface StatementWithLabels {
  instruction: string
  operands: [string, string] | [string] | null
}

export interface Statement extends StatementWithLabels {
  instruction: Instruction
}

export interface Label {
  name: string
  address: number
}

export interface TokenizeResult {
  statements: Statement[]
  labels: Label[]
}

export const tokenize = (code: string): TokenizeResult | never =>
  parseLabels(parseStatements(code))
