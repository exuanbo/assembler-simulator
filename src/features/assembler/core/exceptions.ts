import type { SourceRange } from './types'
import type { Token } from './tokenizer'
import type { Label, OperandType, Operand, Statement } from './parser'
import { trimBracketsAndQuotes } from '../../../common/utils'

// TODO: add ParseError and AssembleError
export abstract class AssemblerError extends Error {
  public message: string
  public range: SourceRange | undefined

  constructor(message: string, range?: SourceRange) {
    super()
    this.message = message
    this.range = range
  }
}

export class StatementError extends AssemblerError {
  constructor({ raw, range }: Token, hasLabel: boolean) {
    super(`Expected ${hasLabel ? '' : 'label or '}instruction: ${raw}`, range)
  }
}

export class InvalidLabelError extends AssemblerError {
  constructor({ raw, range }: Token) {
    const identifier = raw.replace(/:$/, '')
    super(`Label should contain only letter or underscore: ${identifier}`, range)
  }
}

export class MissingEndError extends AssemblerError {
  constructor() {
    super('Expected END at the end of the source code')
  }
}

export class InvalidNumberError extends AssemblerError {
  constructor({ raw, range }: Token) {
    const numberValue = trimBracketsAndQuotes(raw)
    super(`Number should be hexadecimal and less than or equal to FF: ${numberValue}`, range)
  }
}

export class AddressError extends AssemblerError {
  constructor({ raw, range }: Token) {
    const addressValue = trimBracketsAndQuotes(raw)
    super(`Expected number or register: ${addressValue.length > 0 ? addressValue : ']'}`, range)
  }
}

export class OperandTypeError extends AssemblerError {
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
    super(`Expected ${types}: ${raw}`, range)
  }
}

export class MissingCommaError extends AssemblerError {
  constructor({ raw, range }: Token) {
    super(`Expected comma: ${raw}`, range)
  }
}

export class DuplicateLabelError extends AssemblerError {
  constructor({ identifier, range }: Label) {
    super(`Duplicate label: ${identifier}`, range)
  }
}

export class AssembleEndOfMemoryError extends AssemblerError {
  constructor({ range }: Statement) {
    super('Can not generate code beyond the end of RAM', range)
  }
}

export class LabelNotExistError extends AssemblerError {
  constructor({ raw, range }: Operand) {
    super(`Label does not exist: ${raw}`, range)
  }
}

export class JumpDistanceError extends AssemblerError {
  constructor({ raw, range }: Operand) {
    super(`Jump distance should be between -128 and 127: ${raw}`, range)
  }
}
