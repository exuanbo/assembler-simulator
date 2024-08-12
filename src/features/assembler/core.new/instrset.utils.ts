import type * as AST from './ast'
import * as InstrSet from './instrset'

export function resolveOpcode(mnemonic: AST.Mnemonic, operands: AST.Operand[]): number {
  for (const [opcode, patterns] of InstrSet.patterns[mnemonic]) {
    if (matchs(operands, patterns)) {
      return opcode
    }
  }
  throw new Error(`Cannot resolve opcode for instruction '${mnemonic}'`)
}

function match(operand: AST.Operand, pattern: InstrSet.OperandPattern): boolean {
  return (typeof pattern !== 'object')
    ? (operand.type === pattern)
    : matchs(operand.children, pattern.children)
}

function matchs(values: (AST.Operand | AST.OperandValue)[], patterns: InstrSet.OperandPattern[]) {
  return (values.length === patterns.length)
    && values.every((value, i) =>
      (typeof value === 'object') && match(value, patterns[i]))
}
