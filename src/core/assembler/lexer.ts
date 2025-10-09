import type * as AST from './ast'
import { ErrorCode, ParserError, type ParserErrorCode } from './errors'
import { type Token, TokenType } from './token'

export type Lexer = IterableIterator<Token>

export function createLexer(input: string): Lexer {
  return new LexerImpl(input)
}

const enum State {
  Default,
  InIdentifier,
  InNumber,
  InComment,
  InString,
}

class LexerImpl implements Lexer {
  private state = State.Default
  private selectionStart = 0
  private index = 0
  private newlines: number[] = []

  private readonly buffer: string
  private readonly iter: Iterator<Token, void>

  constructor(input: string) {
    this.buffer = input
    this.iter = this.parse()
  }

  [Symbol.iterator]() {
    return this
  }

  next() {
    return this.iter.next()
  }

  private* parse(): Generator<Token, void> {
    const len = this.buffer.length
    while (this.index < len) {
      const c = this.buffer.charCodeAt(this.index)
      if (c === CharCode.NewLine) {
        this.newlines.push(this.index)
      }
      switch (this.state) {
      case State.Default:
        yield* this.stateDefault(c)
        break
      case State.InIdentifier:
        yield* this.stateInIdentifier(c)
        break
      case State.InNumber:
        yield* this.stateInNumber(c)
        break
      case State.InComment:
        yield* this.stateInComment(c)
        break
      case State.InString:
        yield* this.stateInString(c)
        break
      }
      this.index++
    }
    yield* this.stateFinal()
  }

  private getPos(index: number): AST.Position {
    let line = 1
    let column = index + 1
    for (let i = this.newlines.length - 1; i >= 0; i--) {
      const newlineIndex = this.newlines[i]
      if (index > newlineIndex) {
        line = i + 2
        column = index - newlineIndex
        break
      }
    }
    return {
      line,
      column,
      offset: index,
    }
  }

  private getLoc(start: number, end: number): AST.SourceLocation {
    return {
      start: this.getPos(start),
      end: this.getPos(end),
    }
  }

  private error(code: ParserErrorCode, start: number, end: number): ParserError {
    return new ParserError(code, this.getLoc(start, end))
  }

  private create(type: TokenType, start: number, end: number): Token {
    return {
      type,
      value: this.buffer.slice(start, end),
      loc: this.getLoc(start, end),
    }
  }

  private* stateDefault(c: number) {
    if (isWhitespace(c)) {
      // skip
    }
    else if (isDigit(c)) {
      this.state = State.InNumber
      this.selectionStart = this.index
    }
    else if (isWord(c)) {
      this.state = State.InIdentifier
      this.selectionStart = this.index
    }
    else if (c === CharCode.Comma) {
      yield this.create(TokenType.Comma, this.index, this.index + 1)
    }
    else if (c === CharCode.LeftSquare) {
      yield this.create(TokenType.LeftSquare, this.index, this.index + 1)
    }
    else if (c === CharCode.RightSquare) {
      yield this.create(TokenType.RightSquare, this.index, this.index + 1)
    }
    else if (c === CharCode.Semi) {
      this.state = State.InComment
      this.selectionStart = this.index
    }
    else if (c === CharCode.DoubleQuote) {
      this.state = State.InString
      this.selectionStart = this.index
    }
    else {
      throw this.error(ErrorCode.UnexpectedCharacter, this.index, this.index + 1)
    }
  }

  private* stateInIdentifier(c: number) {
    if (isWord(c)) {
      return
    }
    if (c === CharCode.Colon) {
      yield this.create(TokenType.LabelIdentifier, this.selectionStart, this.index)
      yield this.create(TokenType.Colon, this.index, this.index + 1)
      this.state = State.Default
    }
    else {
      yield this.create(TokenType.Identifier, this.selectionStart, this.index)
      this.state = State.Default
      yield* this.stateDefault(c)
    }
  }

  private* stateInNumber(c: number) {
    if (isDigit(c)) {
      return
    }
    if (isAlpha(c)) {
      this.state = State.InIdentifier
    }
    else {
      yield this.create(TokenType.Number, this.selectionStart, this.index)
      this.state = State.Default
      yield* this.stateDefault(c)
    }
  }

  private* stateInComment(c: number) {
    if (c === CharCode.NewLine) {
      yield this.create(TokenType.Comment, this.selectionStart, this.index)
      this.state = State.Default
    }
  }

  private* stateInString(c: number) {
    if (c === CharCode.DoubleQuote) {
      yield this.create(TokenType.String, this.selectionStart, this.index + 1)
      this.state = State.Default
    }
    else if (c === CharCode.Backslash) {
      this.index++
    }
    else if (c === CharCode.NewLine) {
      throw this.error(ErrorCode.UnterminatedString, this.selectionStart, this.index)
    }
  }

  private* stateFinal() {
    if (this.state !== State.Default) {
      switch (this.state) {
      case State.InString:
        throw this.error(ErrorCode.UnterminatedString, this.selectionStart, this.index)
      case State.InIdentifier:
        yield this.create(TokenType.Identifier, this.selectionStart, this.index)
        break
      case State.InNumber:
        yield this.create(TokenType.Number, this.selectionStart, this.index)
        break
      case State.InComment:
        yield this.create(TokenType.Comment, this.selectionStart, this.index)
        break
      }
    }
    yield this.create(TokenType.EOI, this.index, this.index)
  }
}

function isWhitespace(c: number) {
  return (
    (c === CharCode.Space)
    || (c === CharCode.Tab)
    || (c === CharCode.NewLine)
    || (c === CharCode.CarriageReturn)
  )
}

function isDigit(c: number) {
  return (c >= CharCode.Zero) && (c <= CharCode.Nine)
}

function isAlpha(c: number) {
  return (
    ((c >= CharCode.LowerA) && (c <= CharCode.LowerZ))
    || ((c >= CharCode.UpperA) && (c <= CharCode.UpperZ))
  )
}

function isWord(c: number) {
  return (
    (c === CharCode.Underscore)
    || ((c >= CharCode.Zero) && (c <= CharCode.Nine))
    || ((c >= CharCode.LowerA) && (c <= CharCode.LowerZ))
    || ((c >= CharCode.UpperA) && (c <= CharCode.UpperZ))
  )
}

const enum CharCode {
  Tab            = 0x09, // "\t"
  NewLine        = 0x0a, // "\n"
  CarriageReturn = 0x0d, // "\r"
  Space          = 0x20, // " "
  DoubleQuote    = 0x22, // '"'
  Comma          = 0x2c, // ","
  Zero           = 0x30, // "0"
  Nine           = 0x39, // "9"
  Colon          = 0x3a, // ":"
  Semi           = 0x3b, // ";"
  UpperA         = 0x41, // "A"
  UpperZ         = 0x5a, // "Z"
  LeftSquare     = 0x5b, // "["
  Backslash      = 0x5c, // "\\"
  RightSquare    = 0x5d, // "]"
  Underscore     = 0x5f, // "_"
  LowerA         = 0x61, // "a"
  LowerZ         = 0x7a, // "z"
}
