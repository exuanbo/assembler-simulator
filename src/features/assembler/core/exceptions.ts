import type { Token } from './tokenizer'
import type { Label, OperandType, Operand, Statement } from './parser'
import { trimBracketsAndQuotes } from '../../../common/utils'

export abstract class AssemblerError extends Error {
  public message: string
  public start: number | undefined
  public end: number | undefined

  constructor(message: string, start?: number, end?: number) {
    super()
    this.message = message
    this.start = start
    this.end = end
  }
}

export class StatementError extends AssemblerError {
  constructor({ raw, start, end }: Token, hasLabel: boolean) {
    super(`Expected ${hasLabel ? '' : 'label or '}instruction: ${raw}`, start, end)
  }
}

export class InvalidLabelError extends AssemblerError {
  constructor({ raw, start, end }: Token) {
    const identifier = raw.replace(/:$/, '')
    super(`Label should contain only letter or underscore: ${identifier}`, start, end)
  }
}

export class MissingEndError extends AssemblerError {
  constructor() {
    super('Expected END at the end of the source code')
  }
}

export class InvalidNumberError extends AssemblerError {
  constructor({ raw, start, end }: Token) {
    const numberValue = trimBracketsAndQuotes(raw)
    super(`Number should be hexadecimal and less than or equal to FF: ${numberValue}`, start, end)
  }
}

export class AddressError extends AssemblerError {
  constructor({ raw, start, end }: Token) {
    const addressValue = trimBracketsAndQuotes(raw)
    super(
      `Expected number or register: ${addressValue.length > 0 ? addressValue : ']'}`,
      start,
      end
    )
  }
}

export class OperandTypeError extends AssemblerError {
  constructor({ raw, start, end }: Token, ...expectedTypes: OperandType[]) {
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
    super(`Expected ${types}: ${raw}`, start, end)
  }
}

export class MissingCommaError extends AssemblerError {
  constructor({ raw, start, end }: Token) {
    super(`Expected comma: ${raw}`, start, end)
  }
}

export class DuplicateLabelError extends AssemblerError {
  constructor({ identifier, start, end }: Label) {
    super(`Duplicate label: ${identifier}`, start, end)
  }
}

export class AssembleEndOfMemoryError extends AssemblerError {
  constructor({ start, end }: Statement) {
    super('Can not generate code beyond the end of RAM', start, end)
  }
}

export class LabelNotExistError extends AssemblerError {
  constructor({ raw, start, end }: Operand) {
    super(`Label does not exist: ${raw}`, start, end)
  }
}

export class JumpDistanceError extends AssemblerError {
  constructor({ raw, start, end }: Operand) {
    super(`Jump distance should be between -128 and 127: ${raw}`, start, end)
  }
}
