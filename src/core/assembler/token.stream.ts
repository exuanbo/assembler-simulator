import { createContext } from '@/common/utils/context'
import { invariant } from '@/common/utils/invariant'

import { ErrorCode, ParserError } from './errors'
import { getTokenName, type Token, TokenType } from './token'

export type TokenHandler = ((token: Token) => void)

export type RestoreSnapshot = (() => void)

export interface TokenStream {
  hasMore(): boolean
  expect(type: TokenType): Token
  peek(onToken?: TokenHandler): Token
  next(onToken?: TokenHandler): Token
  snapshot(): RestoreSnapshot
}

export function createTokenStream(iter: Iterator<Token, void>): TokenStream {
  const tokens: Token[] = []
  let position = 0

  const stream: TokenStream = {
    peek(onToken) {
      invariant(position <= tokens.length)
      if (position === tokens.length) {
        const { value } = iter.next()
        invariant(value)
        tokens.push(value)
      }
      const token = tokens[position]
      return (onToken?.(token), token)
    },
    hasMore() {
      const token = stream.peek()
      return (token.type !== TokenType.EOI)
    },
    next(onToken) {
      if (!stream.hasMore()) {
        const end = tokens[position]
        throw new ParserError(ErrorCode.UnexpectedEndOfInput, end.loc)
      }
      const token = tokens[position++]
      return (onToken?.(token), token)
    },
    expect(type) {
      const token = stream.peek()
      if (token.type !== type) {
        const expected = getTokenName(type)
        throw new ParserError(ErrorCode.UnexpectedToken, token.loc, { expected })
      }
      return stream.next()
    },
    snapshot() {
      const positionSnapshot = position
      return () => (position = positionSnapshot)
    },
  }

  return stream
}

export const TokenStream = createContext<TokenStream>()
