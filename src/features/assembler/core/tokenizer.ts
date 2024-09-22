import { call, parseString, trimBrackets } from '@/common/utils'

import {
  EndOfTokenStreamError,
  NotAllowedSingleQuoteError,
  UnexpectedCharacterError,
  UnterminatedAddressError,
  UnterminatedStringError,
} from './exceptions'
import type { SourceRange } from './types'

export enum TokenType {
  Whitespace = 'Whitespace',
  Comment = 'Comment',
  Colon = 'Colon',
  Comma = 'Comma',
  Digits = 'Digits',
  Register = 'Register',
  Address = 'Address',
  String = 'String',
  Unknown = 'Unknown',
}

interface TokenRule {
  type: TokenType
  pattern: RegExp
}

const tokenRules: readonly TokenRule[] = [
  { type: TokenType.Whitespace, pattern: /\s+/ },
  { type: TokenType.Comment,    pattern: /;.*/ },
  { type: TokenType.Colon,      pattern: /:/ },
  { type: TokenType.Comma,      pattern: /,/ },
  { type: TokenType.Digits,     pattern: /\d+\b/ },
  { type: TokenType.Register,   pattern: /[a-dA-D][lL]\b/ },
  { type: TokenType.Address,    pattern: /\[.*?\]/ },
  { type: TokenType.String,     pattern: /"(?:[^\\\r\n]|\\.)*?"/ },
  { type: TokenType.Unknown,    pattern: /\w+/ },
]

const tokenRegExpSource = tokenRules.map(({ pattern }) => `(${pattern.source})`).join('|')
const createTokenRegExp = () => new RegExp(tokenRegExpSource, 'y')

export interface Token {
  type: TokenType
  value: string
  source: string
  range: SourceRange
}

const createToken = (type: TokenType, source: string, index: number): Token => {
  const value = call((): string => {
    switch (type) {
    case TokenType.Register:
    case TokenType.Unknown:
      return source.toUpperCase()
    case TokenType.Address:
      return trimBrackets(source).trim().toUpperCase()
    case TokenType.String:
      return parseString(source)
    default:
      return source
    }
  })
  const from = index
  const to = from + source.length
  return {
    type,
    value,
    source,
    range: { from, to },
  }
}

const shouldSkip = (token: Token) =>
  token.type === TokenType.Whitespace || token.type === TokenType.Comment

interface TokenStream {
  next: () => Token | null
}

const createTokenStream = (source: string): TokenStream => {
  const regexp = createTokenRegExp()
  return {
    next: () => {
      const startIndex = regexp.lastIndex
      const match = regexp.exec(source)
      if (match) {
        for (let ruleIndex = 0; ; ruleIndex++) {
          const value = match[ruleIndex + 1]
          if (value) {
            const { type } = tokenRules[ruleIndex]
            return createToken(type, value, startIndex)
          }
        }
      }
      regexp.lastIndex = startIndex
      if (startIndex === source.length) {
        // end of source
        return null
      }
      const range: SourceRange = { from: startIndex, to: startIndex + 1 }
      const char = source[startIndex]
      switch (char) {
      case '[': {
        const [value] = source.slice(startIndex).match(/^\[\s*\w*/)!
        range.to += value.length - 1
        throw new UnterminatedAddressError(value, range)
      }
      case '"': {
        const [value] = source.slice(startIndex).match(/^".*/)!
        range.to += value.length - 1
        throw new UnterminatedStringError(value, range)
      }
      case "'":
        throw new NotAllowedSingleQuoteError(range)
      }
      throw new UnexpectedCharacterError(char, range)
    },
  }
}

export interface Tokenizer {
  hasMore: () => boolean
  peek: () => Token | null
  peekNext: () => Token | null
  advance: () => void
  consume: () => Token
  match: (type: TokenType) => boolean
}

export const createTokenizer = (source: string): Tokenizer => {
  const stream = createTokenStream(source)
  const streamNext = (): Token | null => {
    let token: Token | null = null
    do {
      token = stream.next()
    } while (token && shouldSkip(token))
    return token
  }

  let current: Token | null = streamNext()
  let next: Token | null = streamNext()

  const assertCurrent = (): Token => {
    if (!current) {
      throw new EndOfTokenStreamError()
    }
    return current
  }

  const tokenizer: Tokenizer = {
    hasMore: () => {
      return !!current
    },
    peek: () => {
      return current
    },
    peekNext: () => {
      return next
    },
    advance: () => {
      current = next
      next = streamNext()
    },
    consume: () => {
      const token = assertCurrent()
      tokenizer.advance()
      return token
    },
    match: (type) => {
      const token = assertCurrent()
      if (token.type !== type) {
        return false
      }
      tokenizer.advance()
      return true
    },
  }
  return tokenizer
}
