import { type ErrorObject, errorToPlainObject } from '@/common/error'
import { escapeBackslashes, escapeInnerSingleQuotes, pipe, trimBrackets } from '@/common/utils'

import type { Label, Operand, OperandType, Statement } from './parser'
import type { Token } from './tokenizer'
import type { SourceRange } from './types'

export interface AssemblerErrorObject extends ErrorObject {
  range: SourceRange | undefined
}

export abstract class AssemblerError extends Error {
  public abstract override name: string
  public range: SourceRange | undefined

  private static escape = pipe(escapeBackslashes, escapeInnerSingleQuotes)

  constructor(message: string, range?: SourceRange) {
    super(AssemblerError.escape(message))
    this.range = range
  }

  // istanbul ignore next
  public toPlainObject(): AssemblerErrorObject {
    return {
      ...errorToPlainObject(this),
      range: this.range,
    }
  }
}

class TokenizeError extends AssemblerError {
  public name = 'TokenizeError'
}

export class UnterminatedAddressError extends TokenizeError {
  constructor(value: string, range: SourceRange) {
    super(`Unterminated address '${value}'.`, range)
  }
}

export class UnterminatedStringError extends TokenizeError {
  constructor(value: string, range: SourceRange) {
    super(`Unterminated string '${value}'.`, range)
  }
}

export class NotAllowedSingleQuoteError extends TokenizeError {
  constructor(range: SourceRange) {
    super('Single quote is not allowed.', range)
  }
}

export class UnexpectedCharacterError extends TokenizeError {
  constructor(char: string, range: SourceRange) {
    super(`Unexpected character '${char}'.`, range)
  }
}

export class EndOfTokenStreamError extends TokenizeError {
  constructor() {
    super('Unexpected end of token stream.')
  }
}

class ParseError extends AssemblerError {
  public name = 'ParseError'
}

export class StatementError extends ParseError {
  constructor({ source, range }: Token, hasLabel: boolean) {
    super(`Expected ${hasLabel ? '' : 'label or '}instruction, got '${source}'.`, range)
  }
}

export class InvalidLabelError extends ParseError {
  constructor({ source, range }: Token) {
    const identifier = source.replace(/:$/, '')
    super(`Label should contain only letter or underscore, got '${identifier}'.`, range)
  }
}

export class MissingEndError extends ParseError {
  constructor() {
    super('Expected END at the end of the source code.')
  }
}

export class InvalidNumberError extends ParseError {
  constructor({ source, range }: Token) {
    const numberValue = trimBrackets(source).trim()
    super(`Number '${numberValue}' is greater than FF.`, range)
  }
}

export class InvalidStringError extends ParseError {
  constructor({ value, range }: Token, charIndex: number) {
    super(`UTF-16 code of character '${value[charIndex]}' is greater than FF.`, range)
  }
}

export class AddressError extends ParseError {
  constructor({ source, range: { from, to } }: Token) {
    const addressValue = trimBrackets(source).trim()
    const range: SourceRange = {
      from: from + 1,
      to: to - Math.min(1, addressValue.length),
    }
    super(`Expected number or register, got '${addressValue || ']'}'.`, range)
  }
}

export class OperandTypeError extends ParseError {
  constructor({ source, range }: Token, expectedTypes: OperandType[]) {
    const types = expectedTypes
      .map((type) => type.replace(/[A-Z]/g, (char) => ` ${char.toLowerCase()}`).trimStart())
      .reduce((acc, cur, idx) => {
        switch (idx) {
          case 0:
            return cur
          case expectedTypes.length - 1:
            return `${acc} or ${cur}`
          default:
            return `${acc}, ${cur}`
        }
      }, '')
    super(`Expected ${types}, got '${source}'.`, range)
  }
}

export class MissingCommaError extends ParseError {
  constructor({ source, range }: Token) {
    super(`Expected comma, got '${source}'.`, range)
  }
}

class AssembleError extends AssemblerError {
  public name = 'AssembleError'
}

export class DuplicateLabelError extends AssembleError {
  constructor({ identifier, range }: Label) {
    super(`Duplicate label '${identifier}'.`, range)
  }
}

export class AssembleEndOfMemoryError extends AssembleError {
  constructor({ range }: Statement) {
    super('Can not generate code beyond the end of RAM.', range)
  }
}

export class LabelNotExistError extends AssembleError {
  constructor({ source, range }: Operand) {
    super(`Label '${source}' does not exist.`, range)
  }
}

export class JumpDistanceError extends AssembleError {
  constructor({ range }: Operand) {
    super('Jump distance should be between -128 and 127.', range)
  }
}
