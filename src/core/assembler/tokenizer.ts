export enum TokenType {
  Whitespace = 'WHITESPACE',
  Comment = 'COMMENT',
  Digits = 'DIGITS',
  Address = 'ADDRESS',
  String = 'STRING',
  Comma = 'COMMA',
  Unknown = 'UNKNOWN'
}

export class Token {
  public type: TokenType
  public value: string
  public position: number
  public length: number

  constructor(type: TokenType, value: string, position: number) {
    this.type = type
    switch (type) {
      case TokenType.Address:
        this.value = value.replace(/[[\]]/g, '')
        break
      case TokenType.String:
        this.value = value.replace(/"/g, '')
        break
      default:
        this.value = value
    }
    this.position = position
    this.length = value.length
  }

  public getOriginalValue(): string {
    switch (this.type) {
      case TokenType.Address:
        return `[${this.value}]`
      case TokenType.String:
        return `"${this.value}"`
      default:
        return this.value
    }
  }
}

type Matcher = (input: string, index: number) => Token | null

const createMatcher =
  (regex: RegExp, type: TokenType): Matcher =>
  (input: string, index: number) => {
    const match = regex.exec(input.substring(index))
    return match === null ? null : new Token(type, match[0], index)
  }

const matchWhitespace = createMatcher(/^\s+/, TokenType.Whitespace)
const matchComment = createMatcher(/^;.*/, TokenType.Comment)
const matchDigits = createMatcher(/^\d+(?=,|;|\s+)/, TokenType.Digits)
const matchAddress = createMatcher(/^\[\S*?\](?=,|;|\s+)/, TokenType.Address)
const matchString = createMatcher(/^"[^\r\n]*?"(?=,|;|\s+)/, TokenType.String)
const matchComma = createMatcher(/^,/, TokenType.Comma)
const matchUnknown = createMatcher(/^\S+?(?=,|;|\s+)/, TokenType.Unknown)

const matchers = [
  matchWhitespace,
  matchComment,
  matchDigits,
  matchAddress,
  matchString,
  matchComma,
  matchUnknown
]

export const tokenize = (input: string): Token[] => {
  const tokens: Token[] = []
  let index = 0
  while (index < input.length) {
    matchers.some(match => {
      const token = match(input, index)
      if (token !== null) {
        if (token.type !== TokenType.Whitespace && token.type !== TokenType.Comment) {
          if (token.type === TokenType.Address || token.type === TokenType.Unknown) {
            token.value = token.value.toUpperCase()
          }
          tokens.push(token)
        }
        index += token.length
        return true
      }
      return false
    })
  }
  return tokens
}
