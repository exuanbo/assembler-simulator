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
      case TokenType.String:
        this.value = value.slice(1, -1)
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

const matchRegex =
  (regex: RegExp, type: TokenType) =>
  (input: string, index: number): Token | null => {
    const match = regex.exec(input.slice(index))
    return match === null ? null : new Token(type, match[0], index)
  }

const tokenMatchers = [
  matchRegex(/^\s+/, TokenType.Whitespace),
  matchRegex(/^;.*/, TokenType.Comment),
  matchRegex(/^\d+(?=,|;|\s+)/, TokenType.Digits),
  matchRegex(/^\[\S*?\](?=,|;|\s+)/, TokenType.Address),
  matchRegex(/^"[^\r\n]*?"(?=,|;|\s+)/, TokenType.String),
  matchRegex(/^,/, TokenType.Comma),
  matchRegex(/^\S+?(?=,|;|\s+)/, TokenType.Unknown)
]

export const tokenize = (input: string): Token[] => {
  const tokens: Token[] = []
  let index = 0
  while (index < input.length) {
    tokenMatchers.some(matchToken => {
      const token = matchToken(input, index)
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
