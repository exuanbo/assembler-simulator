import type * as AST from './ast'
import { type AssemblyError, mergeErrors } from './errors'
import type { LabelMap } from './parser.context'

export interface AssemblyUnit {
  ast: AST.Program | null
  labels: LabelMap
  chunks: CodeChunk[]
  errors: AssemblyError[]
  warnings: AssemblyError[]
}

export interface CodeChunk {
  offset: number
  buffer: Uint8Array
  node: AssemblyNode
}

export interface AssemblyNode extends AST.Node {
  children: ArrayLike<AssemblyNodeValue>
}

export type AssemblyNodeValue
  = | AssemblyNode
    | (
      | AST.Mnemonic
      | AST.OperandValue
      | AST.StringLiteral
  )

const nil: LabelMap = new Map()

export function initUnit(): AssemblyUnit {
  return {
    ast: null,
    labels: nil,
    chunks: [],
    errors: [],
    warnings: [],
  }
}

export function finalize(unit: AssemblyUnit, updates: Partial<AssemblyUnit>): AssemblyUnit {
  const updated: AssemblyUnit = {
    ...unit,
    ...updates,
  }
  mergeErrors(updated.warnings)
  mergeErrors(updated.errors)
  return updated
}
