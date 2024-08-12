import { invariant } from '@/common/utils/invariant'

import type * as AST from './ast'

export const enum TokenType {
  Colon,
  Comma,
  LeftSquare,
  RightSquare,
  Number,
  String,
  Identifier,
  LabelIdentifier,
  Comment,
  EOI,
}

const tokennames: Partial<Record<TokenType, string>> = {
  [TokenType.Comma]:       'comma',
  [TokenType.RightSquare]: 'closing square bracket',
}

export function getTokenName(type: TokenType): string {
  const name = tokennames[type]
  invariant(name, `Token name of type '${type}' is undefined`)
  return name
}

export interface Token {
  type: TokenType
  value: string
  loc: AST.SourceLocation
}
