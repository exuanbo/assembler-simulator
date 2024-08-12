import { createContext, useContext } from '@/common/utils/context'

import type * as AST from './ast'
import { ErrorCode, type ParserDiagnostic, ParserError, ParserWarning } from './errors'

export interface LabelInfo {
  address: number
  refs: AST.SourceLocation[]
  loc: AST.SourceLocation | null
}

export type LabelMap = ReadonlyMap<AST.IdentifierValue, LabelInfo>

export interface ParserContext {
  get labels(): LabelMap
  refLabel(node: AST.Identifier): void
  addLabel(node: AST.Identifier): void
  checkLabels(): void

  catchError(callback: (() => void)): void
  flushErrors(): ParserDiagnostic[]
}

export function createParserContext(): ParserContext {
  const labelMap = new Map<AST.IdentifierValue, LabelInfo>()
  const errors: ParserDiagnostic[] = []

  return {
    get labels() {
      return labelMap
    },
    refLabel({ children: [id], loc }) {
      const label = labelMap.get(id)
      if (label) {
        label.refs.push(loc)
      }
      else {
        labelMap.set(id, { address: NaN, refs: [loc], loc: null })
      }
    },
    addLabel({ children: [id], loc }) {
      const label = labelMap.get(id)
      if (label) {
        if (label.loc) {
          errors.push(new ParserError(ErrorCode.DuplicateLabel, loc, { id }))
        }
        label.loc = loc
      }
      else {
        labelMap.set(id, { address: NaN, refs: [], loc })
      }
    },
    checkLabels() {
      labelMap.forEach((label, id) => {
        if (label.loc) {
          if (!label.refs.length) {
            errors.push(new ParserWarning(ErrorCode.UnreferencedLabel, label.loc, { id }))
          }
        }
        else {
          errors.push(new ParserError(ErrorCode.UndefinedLabel, label.refs, { id }))
        }
      })
    },
    catchError(callback) {
      try {
        callback()
      }
      catch (error) {
        if (error instanceof ParserError) {
          errors.push(error)
        }
        else throw error
      }
    },
    flushErrors() {
      return errors.splice(0, errors.length)
    },
  }
}

export const ParserContext = createContext<ParserContext>()

export function useParserContext(): ParserContext {
  return useContext(ParserContext)
}
