import { escapeBackslashes, escapeInnerSingleQuotes, trimBrackets } from '@/common/utils'

import type { Label, Operand, OperandType, Statement } from './parser'
import type { Token } from './tokenizer'
import type { SourceRange } from './types'

export interface AssemblerErrorObject {
  name: string
  message: string
  range: SourceRange | undefined
}

export abstract class AssemblerError extends Error {
  public abstract override name: string
  public range: SourceRange | undefined

  constructor(message: string, range?: SourceRange) {
    super(message)
    this.range = range
  }

  // istanbul ignore next
  public toPlainObject(): AssemblerErrorObject {
    return {
      name: this.name,
      message: this.message,
      range: this.range,
    }
  }
}

class TokenizeError extends AssemblerError {
  public name = 'TokenizeError'
}

export class EndOfTokenStreamError extends TokenizeError {
  constructor() {
    super('Unexpected end of token stream.')
  }
}

class ParseError extends AssemblerError {
  public name = 'ParseError'

  constructor(message: string, range?: SourceRange) {
    super(escapeInnerSingleQuotes(escapeBackslashes(message)), range)
  }
}

export class StatementError extends ParseError {
  constructor({ raw, range }: Token, hasLabel: boolean) {
    super(`Expected ${hasLabel ? '' : 'label or '}instruction, got '${raw}'.`, range)
  }
}

export class InvalidLabelError extends ParseError {
  constructor({ raw, range }: Token) {
    const identifier = raw.replace(/:$/, '')
    super(`Label should contain only letter or underscore, got '${identifier}'.`, range)
  }
}

export class MissingEndError extends ParseError {
  constructor() {
    super('Expected END at the end of the source code.')
  }
}

export class InvalidNumberError extends ParseError {
  constructor({ raw, range }: Token) {
    const numberValue = trimBrackets(raw).trim()
    super(`Number '${numberValue}' is greater than FF.`, range)
  }
}

export class InvalidStringError extends ParseError {
  constructor({ value, range }: Token, charIndex: number) {
    super(`UTF-16 code of character '${value[charIndex]}' is greater than FF.`, range)
  }
}

export class AddressError extends ParseError {
  constructor({ raw, range }: Token) {
    const addressValue = trimBrackets(raw).trim()
    super(
      `Expected number or register, got '${addressValue.length > 0 ? addressValue : ']'}'.`,
      range,
    )
  }
}

export class UnterminatedAddressError extends ParseError {
  constructor({ raw, range }: Token) {
    super(`Unterminated address '${raw.trimEnd()}'.`, range)
  }
}

export class UnterminatedStringError extends ParseError {
  constructor({ raw, range }: Token) {
    super(`Unterminated string '${raw}'.`, range)
  }
}

export class SingleQuoteError extends ParseError {
  constructor({ range }: Token) {
    super('Single quote is not allowed.', range)
  }
}

export class OperandTypeError extends ParseError {
  constructor({ raw, range }: Token, ...expectedTypes: OperandType[]) {
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
    super(`Expected ${types}, got '${raw}'.`, range)
  }
}

export class MissingCommaError extends ParseError {
  constructor({ raw, range }: Token) {
    super(`Expected comma, got '${raw}'.`, range)
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
  constructor({ raw, range }: Operand) {
    super(`Label '${raw}' does not exist.`, range)
  }
}

export class JumpDistanceError extends AssembleError {
  constructor({ range }: Operand) {
    super('Jump distance should be between -128 and 127.', range)
  }
}
