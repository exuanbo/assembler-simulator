import type { Locatable } from './types'
import { Mnemonic } from '../../../common/constants'
import { trimBracketsAndQuotes, call } from '../../../common/utils'

export enum TokenType {
  Whitespace = 'Whitespace',
  Comment = 'Comment',
  Colon = 'Colon',
  // TODO: OpenBracket, ClosedBracket
  Comma = 'Comma',
  Digits = 'Digits',
  Register = 'Register',
  Address = 'Address',
  String = 'String',
  Unknown = 'Unknown'
}

export interface Token extends Locatable {
  type: TokenType
  value: string
  raw: string
}

const createToken = (type: TokenType, value: string, start: number): Token => {
  const tokenValue = call((): string => {
    const normalizedValue = trimBracketsAndQuotes(value)
    switch (type) {
      case TokenType.Register:
      case TokenType.Address:
      case TokenType.Unknown:
        return normalizedValue.toUpperCase()
      default:
        return normalizedValue
    }
  })
  const end = start + value.length
  return {
    type,
    value: tokenValue,
    raw: value,
    start,
    end
  }
}

type TokenMatcher = (input: string, index: number) => Token | null

const matchRegExp =
  (regex: RegExp, type: TokenType): TokenMatcher =>
  (input, index) => {
    const match = regex.exec(input.slice(index))
    return match !== null ? createToken(type, match[0], index) : null
  }

const tokenMatchers = [
  matchRegExp(/^\s+/, TokenType.Whitespace),
  matchRegExp(/^;.*/, TokenType.Comment),
  matchRegExp(/^:/, TokenType.Colon),
  matchRegExp(/^,/, TokenType.Comma),
  matchRegExp(/^\d+\b/, TokenType.Digits),
  matchRegExp(/^[a-dA-D][lL]\b/, TokenType.Register),
  matchRegExp(/^\[.*?\]/, TokenType.Address),
  matchRegExp(/^".*"/, TokenType.String),
  matchRegExp(/^[^\s;:,]+/, TokenType.Unknown)
]

const skipableTypes = [TokenType.Whitespace, TokenType.Comment]

export const tokenize = (input: string): Token[] => {
  const tokens: Token[] = []
  for (let index = 0; index < input.length; ) {
    for (let matcherIndex = 0; matcherIndex < tokenMatchers.length; matcherIndex += 1) {
      const token = tokenMatchers[matcherIndex](input, index)
      if (token !== null) {
        if (!skipableTypes.includes(token.type)) {
          tokens.push(token)
        }
        index = token.value === Mnemonic.END ? input.length : token.end
        break
      }
    }
  }
  return tokens
}
