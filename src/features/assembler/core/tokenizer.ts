import type { SourceRange } from './types'
import { Mnemonic } from '../../../common/constants'
import { trimBracketsAndQuotes, call } from '../../../common/utils'

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
  readonly type: TokenType
  readonly value: string
  readonly raw: string
  readonly range: SourceRange
}

const createToken = (type: TokenType, value: string, from: number): Token => {
  const normalizedValue = trimBracketsAndQuotes(value)
  const tokenValue = call((): string => {
    switch (type) {
      case TokenType.Register:
      case TokenType.Address:
      case TokenType.Unknown:
        return normalizedValue.toUpperCase()
      case TokenType.String:
        return JSON.parse(`"${normalizedValue}"`) // manually escape
      default:
        return normalizedValue
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

const tokenMatchers: readonly TokenMatcher[] = [
  matchRegExp(/^\s+/, TokenType.Whitespace),
  matchRegExp(/^;.*/, TokenType.Comment),
  matchRegExp(/^:/, TokenType.Colon),
  matchRegExp(/^,/, TokenType.Comma),
  matchRegExp(/^\d+\b/, TokenType.Digits),
  matchRegExp(/^[a-dA-D][lL]\b/, TokenType.Register),
  matchRegExp(/^\[.*?\]/, TokenType.Address),
  matchRegExp(/^"(?:[^\\\r\n]|\\.)*?"/, TokenType.String),
  matchRegExp(/^(?:[^\s;:,"]+|".*)/, TokenType.Unknown)
]

export const tokenize = (input: string): Token[] => {
  const tokens: Token[] = []
  for (let index = 0; index < input.length; ) {
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
  }
  return tokens
}
