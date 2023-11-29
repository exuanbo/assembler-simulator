import type { SourceRange } from './types'
import { EndOfTokenStreamError } from './exceptions'
import { trimBrackets, parseString, call } from '@/common/utils'

export enum TokenType {
  Whitespace = 'Whitespace',
  Comment = 'Comment',
  Colon = 'Colon',
  Comma = 'Comma',
  Digits = 'Digits',
  Register = 'Register',
  Address = 'Address',
  String = 'String',
  Unknown = 'Unknown'
}

interface TokenRule {
  type: TokenType
  pattern: RegExp
}

// prettier-ignore
const tokenRules: readonly TokenRule[] = [
  { type: TokenType.Whitespace, pattern: /\s+/ },
  { type: TokenType.Comment,    pattern: /;.*/ },
  { type: TokenType.Colon,      pattern: /:/ },
  { type: TokenType.Comma,      pattern: /,/ },
  { type: TokenType.Digits,     pattern: /\d+\b/ },
  { type: TokenType.Register,   pattern: /[a-dA-D][lL]\b/ },
  { type: TokenType.Address,    pattern: /\[.*?\]/ },
  { type: TokenType.String,     pattern: /"(?:[^\\\r\n]|\\.)*?"/ },
  { type: TokenType.Unknown,    pattern: /[^\s;:,["]+|\[.*?(?=\s*?(?:[\r\n;:,]|$))|".*/ }
]

const tokenRegExpSource = tokenRules.map(({ pattern }) => `(${pattern.source})`).join('|')
const createTokenRegExp = (): RegExp => new RegExp(tokenRegExpSource, 'y')

export interface Token {
  type: TokenType
  value: string
  raw: string
  range: SourceRange
}

const createToken = (type: TokenType, value: string, index: number): Token => {
  const tokenValue = call((): string => {
    switch (type) {
      case TokenType.Register:
      case TokenType.Unknown:
        return value.toUpperCase()
      case TokenType.Address:
        return trimBrackets(value).trim().toUpperCase()
      case TokenType.String:
        return parseString(value)
      default:
        return value
    }
  })
  const from = index
  const to = from + value.length
  return {
    type,
    value: tokenValue,
    raw: value,
    range: { from, to }
  }
}

interface TokenStream {
  next: () => Token | null
}

const createTokenStream = (source: string): TokenStream => {
  const regexp = createTokenRegExp()
  return {
    next: () => {
      const startIndex = regexp.lastIndex
      const match = regexp.exec(source)
      if (match !== null && match.index === startIndex) {
        for (let ruleIndex = 0; ; ruleIndex++) {
          const value = match[ruleIndex + 1]
          if (value !== undefined) {
            const { type } = tokenRules[ruleIndex]
            return createToken(type, value, match.index)
          }
        }
      }
      regexp.lastIndex = startIndex
      // istanbul ignore next
      if (startIndex < source.length) {
        throw new Error(`Unexpected token ${source[startIndex]} at position ${startIndex}`)
      }
      return null
    }
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
    } while (
      token !== null &&
      (token.type === TokenType.Whitespace || token.type === TokenType.Comment)
    )
    return token
  }

  let current: Token | null = streamNext()
  let next: Token | null = streamNext()

  const assertCurrent = (): Token => {
    if (current === null) {
      throw new EndOfTokenStreamError()
    }
    return current
  }

  const tokenizer: Tokenizer = {
    hasMore: () => {
      return current !== null
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
    match: type => {
      const token = assertCurrent()
      if (token.type !== type) {
        return false
      }
      tokenizer.advance()
      return true
    }
  }
  return tokenizer
}
