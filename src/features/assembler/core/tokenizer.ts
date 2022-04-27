import type { SourceRange } from './types'
import { Mnemonic } from '@/common/constants'
import { trimBrackets, call } from '@/common/utils'

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

export interface Token {
  type: TokenType
  value: string
  raw: string
  range: SourceRange
}

const createToken = (type: TokenType, value: string, from: number): Token => {
  const tokenValue = call((): string => {
    switch (type) {
      case TokenType.Register:
      case TokenType.Unknown:
        return value.toUpperCase()
      case TokenType.Address:
        return trimBrackets(value).trim().toUpperCase()
      case TokenType.String:
        // escape quotes and backslashes
        return JSON.parse(value)
      default:
        return value
    }
  })
  const to = from + value.length
  return {
    type,
    value: tokenValue,
    raw: value,
    range: { from, to }
  }
}

type TokenMatcher = (input: string, index: number) => Token | null

const matchRegExp =
  (regex: RegExp, type: TokenType): TokenMatcher =>
  (input, index) => {
    const match = regex.exec(input.slice(index))
    return match === null ? null : createToken(type, match[0], index)
  }

/* eslint-disable prettier/prettier */

const tokenMatchers: readonly TokenMatcher[] = [
  matchRegExp(/^\s+/,                                              TokenType.Whitespace),
  matchRegExp(/^;.*/,                                              TokenType.Comment),
  matchRegExp(/^:/,                                                TokenType.Colon),
  matchRegExp(/^,/,                                                TokenType.Comma),
  matchRegExp(/^\d+\b/,                                            TokenType.Digits),
  matchRegExp(/^[a-dA-D][lL]\b/,                                   TokenType.Register),
  matchRegExp(/^\[.*?\]/,                                          TokenType.Address),
  matchRegExp(/^"(?:[^\\\r\n]|\\.)*?"/,                            TokenType.String),
  matchRegExp(/^(?:[^\s;:,["]+|\[.*?(?=\s*?(?:[\r\n;:,]|$))|".*)/, TokenType.Unknown)
]

/* eslint-enable prettier/prettier */

export const tokenize = (input: string): Token[] => {
  const tokens: Token[] = []
  for (let index = 0; index < input.length; ) {
    const startIndex = index
    for (const matchToken of tokenMatchers) {
      const token = matchToken(input, index)
      if (token !== null) {
        if (token.type !== TokenType.Whitespace && token.type !== TokenType.Comment) {
          tokens.push(token)
        }
        index = token.value === Mnemonic.END ? input.length : token.range.to
        break
      }
    }
    // istanbul ignore next
    if (index === startIndex) {
      throw new Error(`Tokenization failed with character '${input[index]}' at index ${index}.`)
    }
  }
  return tokens
}
