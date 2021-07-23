import { InvalidTokenError } from './exceptions'

export enum TokenType {
  Comma = 'COMMA',
  String = 'STRING',
  Address = 'ADDRESS',
  Digits = 'DIGITS',
  Unknown = 'UNKNOWN'
}

export class Token {
  public type: TokenType
  public value: string
  public position: number
  public length: number

  constructor(type: TokenType, value: string, position: number) {
    this.type = type
    this.value = value
    this.position = position
    this.length = value.length
    if (type === TokenType.String || type === TokenType.Address) {
      this.length += 2
    }
  }

  public static getOriginalValue(token: Token): string {
    switch (token.type) {
      case TokenType.String:
        return `"${token.value}"`
      case TokenType.Address:
        return `[${token.value}]`
      default:
        return token.value
    }
  }
}

type Tokenizer = (input: string, current: number) => [consumedChars: number, token: Token | null]

const WHITESPACE = /\s/
const RETURN = /[\r\n]/
const TOKEN_SEPARATOR = /[\s,]/
const DIGITS = /[0-9]/
const UNKNOWN = /["0-9:a-zA-Z[\]_]/

const skipWhitespace: Tokenizer = (input, current) =>
  WHITESPACE.test(input[current]) ? [1, null] : [0, null]

const skipComment: Tokenizer = (input, current) => {
  let consumedChars = 0
  let char = input[current]
  if (char === ';') {
    consumedChars++
    char = input[current + consumedChars]
    while (char !== undefined && !RETURN.test(char)) {
      consumedChars++
      char = input[current + consumedChars]
    }
  }
  return [consumedChars, null]
}

const tokenizeCharacter =
  (type: TokenType, value: string): Tokenizer =>
  (input, current) =>
    value === input[current] ? [1, new Token(type, value, current)] : [0, null]

const tokenizeComma = tokenizeCharacter(TokenType.Comma, ',')

const tokenizeEnclosed =
  (type: TokenType, start: string, end: string): Tokenizer =>
  (input, current) => {
    let consumedChars = 0
    let char = input[current]
    if (char === start) {
      let value = ''
      consumedChars++
      char = input[current + consumedChars]
      while (char !== end) {
        if (char === undefined || RETURN.test(char)) {
          return [0, null]
        }
        value += char
        consumedChars++
        char = input[current + consumedChars]
      }
      consumedChars++
      return [consumedChars, new Token(type, value, current)]
    }
    return [0, null]
  }

const tokenizeString = tokenizeEnclosed(TokenType.String, '"', '"')
const tokenizeAddress = tokenizeEnclosed(TokenType.Address, '[', ']')

const tokenizePattern =
  (type: TokenType, pattern: RegExp): Tokenizer =>
  (input, current) => {
    let consumedChars = 0
    let char = input[current]
    if (pattern.test(char)) {
      let value = ''
      do {
        value += char
        consumedChars++
        char = input[current + consumedChars]
      } while (char !== undefined && pattern.test(char))
      if (char === undefined || TOKEN_SEPARATOR.test(char)) {
        return [consumedChars, new Token(type, value, current)]
      }
    }
    return [0, null]
  }

const tokenizeDigits = tokenizePattern(TokenType.Digits, DIGITS)
const tokenizeUnknown = tokenizePattern(TokenType.Unknown, UNKNOWN)

const tokenizers = [
  skipWhitespace,
  skipComment,
  tokenizeComma,
  tokenizeString,
  tokenizeAddress,
  tokenizeDigits,
  tokenizeUnknown
]

export const tokenize = (input: string): Token[] => {
  let currentIndex = 0
  const tokens: Token[] = []
  while (currentIndex < input.length) {
    const isTokenized = tokenizers.some(tokenizer => {
      const [consumedChars, token] = tokenizer(input, currentIndex)
      currentIndex += consumedChars
      if (token !== null) {
        if (token.type === TokenType.Address || token.type === TokenType.Unknown) {
          token.value = token.value.toUpperCase()
        }
        tokens.push(token)
      }
      return consumedChars > 0
    })
    if (!isTokenized) {
      throw new InvalidTokenError(input[currentIndex], currentIndex)
    }
  }
  return tokens
}
