export enum TokenType {
  Whitespace = 'WHITESPACE',
  Comment = 'COMMENT',
  Comma = 'COMMA',
  Digits = 'DIGITS',
  Register = 'REGISTER',
  Address = 'ADDRESS',
  String = 'STRING',
  Unknown = 'UNKNOWN'
}

export interface Token {
  type: TokenType
  value: string
  position: number
  length: number
}

const createToken = (type: TokenType, value: string, position: number): Token => {
  const tokenValue = ((): string => {
    const normalizedValue = value.replace(/^[["](.*)["\]]$/, '$1')
    switch (type) {
      case TokenType.Register:
      case TokenType.Address:
      case TokenType.Unknown:
        return normalizedValue.toUpperCase()
      default:
        return normalizedValue
    }
  })()
  const length = value.length
  return {
    type,
    value: tokenValue,
    position,
    length
  }
}

type TokenMatcher = (input: string, index: number) => Token | null

const matchRegex =
  (regex: RegExp, type: TokenType): TokenMatcher =>
  (input, index) => {
    const match = regex.exec(input.slice(index))
    return match !== null ? createToken(type, match[0], index) : null
  }

const tokenMatchers = [
  matchRegex(/^\s+/, TokenType.Whitespace),
  matchRegex(/^;.*/, TokenType.Comment),
  matchRegex(/^,/, TokenType.Comma),
  matchRegex(/^\d+(?=[\s,;])/, TokenType.Digits),
  matchRegex(/^[a-dA-D][lL](?=[\s,;])/, TokenType.Register),
  matchRegex(/^\[\S*?\](?=[\s,;])/, TokenType.Address),
  matchRegex(/^"[^\r\n]*?"(?=[\s,;])/, TokenType.String),
  matchRegex(/^[^\s,;]+/, TokenType.Unknown)
]

export const tokenize = (input: string): Token[] => {
  const tokens: Token[] = []
  let index = 0
  while (index < input.length) {
    tokenMatchers.some(matchToken => {
      const token = matchToken(input, index)
      // TODO `const isMatched = token !== null`
      if (token !== null) {
        if (token.type !== TokenType.Whitespace && token.type !== TokenType.Comment) {
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
