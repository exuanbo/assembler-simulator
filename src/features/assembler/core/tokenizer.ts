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
  current: Token
  hasCurrent: boolean
  peekNext: () => Token | null
  advance: () => void
  consume: () => Token
  match: (type: TokenType, createError: (token: Token) => Error) => void
}

export const createTokenizer = (source: string): Tokenizer => {
  const stream = createTokenStream(source)
  const extractNextToken = (): Token | null => {
    let token: Token | null = null
    do {
      token = stream.next()
    } while (
      token !== null &&
      (token.type === TokenType.Whitespace || token.type === TokenType.Comment)
    )
    return token
  }
  let current: Token | null = extractNextToken()
  let next: Token | null = null
  const tokenizer: Tokenizer = {
    get current() {
      if (current === null) {
        throw new EndOfTokenStreamError()
      }
      return current
    },
    get hasCurrent() {
      return current !== null
    },
    peekNext: () => {
      if (next === null) {
        next = extractNextToken()
      }
      return next
    },
    advance: () => {
      if (next !== null) {
        current = next
        next = null
        return
      }
      current = extractNextToken()
    },
    consume: () => {
      const token = tokenizer.current
      tokenizer.advance()
      return token
    },
    match: (type, createError) => {
      const token = tokenizer.current
      if (token.type !== type) {
        throw createError(token)
      }
      tokenizer.advance()
    }
  }
  return tokenizer
}
