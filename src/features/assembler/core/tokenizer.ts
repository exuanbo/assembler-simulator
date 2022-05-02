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

interface Tokenizer {
  reset: (source: string) => void
  next: () => Token | null
}

const createTokenizer = (rules: Record<TokenType, RegExp>): Tokenizer => {
  const ruleEntries = Object.entries(rules)
  const regexp = new RegExp(ruleEntries.map(([, pattern]) => `(${pattern.source})`).join('|'), 'y')
  let buffer = ''
  return {
    reset: source => {
      buffer = source
      regexp.lastIndex = 0
    },
    next: () => {
      const startIndex = regexp.lastIndex
      const match = regexp.exec(buffer)
      if (match !== null && match.index === startIndex) {
        for (let ruleIndex = 0; ; ruleIndex++) {
          if (match[ruleIndex + 1] !== undefined) {
            const [type] = ruleEntries[ruleIndex]
            return createToken(type as TokenType, match[0], match.index)
          }
        }
      }
      regexp.lastIndex = startIndex
      // istanbul ignore next
      if (startIndex < buffer.length) {
        throw new Error(`Unexpected token '${buffer[startIndex]}' at index ${startIndex}.`)
      }
      return null
    }
  }
}

/* eslint-disable prettier/prettier */

const tokenizer = createTokenizer({
  [TokenType.Whitespace]: /\s+/,
  [TokenType.Comment]:    /;.*/,
  [TokenType.Colon]:      /:/,
  [TokenType.Comma]:      /,/,
  [TokenType.Digits]:     /\d+\b/,
  [TokenType.Register]:   /[a-dA-D][lL]\b/,
  [TokenType.Address]:    /\[.*?\]/,
  [TokenType.String]:     /"(?:[^\\\r\n]|\\.)*?"/,
  [TokenType.Unknown]:    /[^\s;:,["]+|\[.*?(?=\s*?(?:[\r\n;:,]|$))|".*/
})

/* eslint-enable prettier/prettier */

export const tokenize = (input: string): Token[] => {
  tokenizer.reset(input)
  const tokens: Token[] = []
  let token: Token | null
  while ((token = tokenizer.next()) !== null) {
    if (token.type !== TokenType.Whitespace && token.type !== TokenType.Comment) {
      tokens.push(token)
      if (token.value === Mnemonic.END) {
        break
      }
    }
  }
  return tokens
}
