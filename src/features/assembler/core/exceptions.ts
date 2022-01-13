import type { SourceRange } from './types'
import type { Token } from './tokenizer'
import type { Label, OperandType, Operand, Statement } from './parser'
import {
  trimBracketsAndQuotes,
  escapeBackslashes,
  escapeInnerSingleQuotes
} from '../../../common/utils'

export interface AssemblerErrorObject {
  readonly type: string
  readonly message: string
  readonly range: SourceRange | undefined
}

export abstract class AssemblerError extends Error {
  public abstract type: string
  public range: SourceRange | undefined

  constructor(message: string, range?: SourceRange) {
    super(message)
    this.range = range
  }

  // istanbul ignore next
  public toPlainObject(): AssemblerErrorObject {
    return {
      type: this.type,
      message: this.message,
      range: this.range
    }
  }
}

class ParserError extends AssemblerError {
  public type: string

  constructor(message: string, range?: SourceRange) {
    super(escapeInnerSingleQuotes(escapeBackslashes(message)), range)
    this.type = 'ParserError'
  }
}

export class StatementError extends ParserError {
  constructor({ raw, range }: Token, hasLabel: boolean) {
    super(`Expected ${hasLabel ? '' : 'label or '}instruction, got '${raw}'.`, range)
  }
}

export class InvalidLabelError extends ParserError {
  constructor({ raw, range }: Token) {
    const identifier = raw.replace(/:$/, '')
    super(`Label should contain only letter or underscore, got '${identifier}'.`, range)
  }
}

export class MissingEndError extends ParserError {
  constructor() {
    super('Expected END at the end of the source code.')
  }
}

export class InvalidNumberError extends ParserError {
  constructor({ raw, range }: Token) {
    const numberValue = trimBracketsAndQuotes(raw)
    super(`Number should be hexadecimal and less than or equal to FF, got '${numberValue}'.`, range)
  }
}

export class AddressError extends ParserError {
  constructor({ raw, range }: Token) {
    const addressValue = trimBracketsAndQuotes(raw)
    super(
      `Expected number or register, got '${addressValue.length > 0 ? addressValue : ']'}'.`,
      range
    )
  }
}

export class SingleQuoteError extends ParserError {
  constructor({ range }: Token) {
    super('Single quote is not allowed.', range)
  }
}

export class UnterminatedStringError extends ParserError {
  constructor({ raw, range }: Token) {
    super(`Unterminated string '${raw}'.`, range)
  }
}

export class OperandTypeError extends ParserError {
  constructor({ raw, range }: Token, ...expectedTypes: OperandType[]) {
    const types = expectedTypes
      .map(type => type.replace(/[A-Z]/g, char => ` ${char.toLowerCase()}`).trimStart())
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

export class MissingCommaError extends ParserError {
  constructor({ raw, range }: Token) {
    super(`Expected comma, got '${raw}'.`, range)
  }
}

class AssembleError extends AssemblerError {
  public type: string

  constructor(message: string, range?: SourceRange) {
    super(message, range)
    this.type = 'AssembleError'
  }
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
  constructor({ raw, range }: Operand) {
    super(`Jump distance should be between -128 and 127, to label '${raw}'.`, range)
  }
}
