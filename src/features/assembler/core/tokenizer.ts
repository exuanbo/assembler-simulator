import type { Locatable } from './types'
import { Mnemonic } from '../../../common/constants'
import { trimBracketsAndQuotes, call } from '../../../common/utils'

export enum TokenType {
  Whitespace = 'Whitespace',
  Comment = 'Comment',
  Comma = 'Comma',
  Digits = 'Digits',
  Register = 'Register',
  Address = 'Address',
  // TODO: RegisterAddress
  String = 'String',
  Unknown = 'Unknown'
}

export interface Token extends Locatable {
  type: TokenType
  value: string
  raw: string
}

const createToken = (
  type: TokenType,
  value: string,
  start: number,
  line: number,
  column: number
): Token => {
  const tokenValue = call((): string => {
    const normalizedValue = trimBracketsAndQuotes(value)
    switch (type) {
      // TODO: case TokenType.RegisterAddress
      case TokenType.Register:
      case TokenType.Address:
      case TokenType.Unknown:
        return normalizedValue.toUpperCase()
      default:
        return normalizedValue
    }
  })
  const end = start + value.length
  const endColumn = column + value.length
  return {
    type,
    value: tokenValue,
    raw: value,
    start,
    end,
    loc: {
      start: {
        line,
        column
      },
      end: {
        line,
        column: endColumn
      }
    }
  }
}

type TokenMatcher = (input: string, index: number, line: number, column: number) => Token | null

// TODO: rename function
const matchRegex =
  (regex: RegExp, type: TokenType): TokenMatcher =>
  (input, index, line, column) => {
    const match = regex.exec(input.slice(index))
    // TODO: seprate statements
    return match !== null ? createToken(type, match[0], index, line, column) : null
  }

const tokenMatchers = [
  matchRegex(/^\s+/, TokenType.Whitespace),
  matchRegex(/^;.*/, TokenType.Comment),
  matchRegex(/^,/, TokenType.Comma),
  matchRegex(/^\d+\b/, TokenType.Digits),
  matchRegex(/^[a-dA-D][lL]\b/, TokenType.Register),
  matchRegex(/^\[\S*?\](?=[\s;,]|$)/, TokenType.Address),
  // TODO: TokenType.RegisterAddress
  matchRegex(/^"[^\r\n]*?"(?=[\s;,]|$)/, TokenType.String),
  matchRegex(/^[^\s;,]+/, TokenType.Unknown)
]

const NEWLINE_REGEXP = /(?:\n|\r\n)/g

export const tokenize = (input: string): Token[] => {
  const tokens: Token[] = []
  let index = 0
  let line = 0
  let column = 0
  while (index < input.length) {
    tokenMatchers.some(matchToken => {
      const token = matchToken(input, index, line, column)
      const isMatched = token !== null
      if (isMatched) {
        if (token.type !== TokenType.Whitespace && token.type !== TokenType.Comment) {
          tokens.push(token)
        }
        index = token.value === Mnemonic.END ? input.length : token.end
        const newlinesCount = (token.raw.match(NEWLINE_REGEXP) ?? []).length
        line += newlinesCount
        column = newlinesCount > 0 ? 0 : token.loc.end.column
      }
      return isMatched
    })
  }
  return tokens
}
