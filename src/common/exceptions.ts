import type {
  SourceLocation,
  Token,
  Label,
  OperandType,
  Operand,
  Statement
} from '../features/assembler/core'
import { trimBrackets } from './utils'

export abstract class AssemblerError extends Error {
  public message: string
  public start: number | undefined
  public end: number | undefined
  public loc: SourceLocation | undefined

  constructor(message: string, start?: number, end?: number, loc?: SourceLocation) {
    super()
    this.message = message
    this.start = start
    this.end = end
    this.loc = loc
  }
}

export class StatementError extends AssemblerError {
  constructor({ raw, start, end, loc }: Token, hasLabel: boolean) {
    super(`Expected ${hasLabel ? '' : 'label or '}instruction: ${raw}`, start, end, loc)
  }
}

export class InvalidLabelError extends AssemblerError {
  constructor({ raw, start, end, loc }: Token) {
    const identifier = raw.replace(/:$/, '')
    super(`Label should contain only letter or underscore: ${identifier}`, start, end, loc)
  }
}

export class MissingEndError extends AssemblerError {
  constructor() {
    super('Expected END at the end of the source code')
  }
}

export class InvalidNumberError extends AssemblerError {
  constructor({ raw, start, end, loc }: Token) {
    const numberValue = trimBrackets(raw)
    super(
      `Number should be hexadecimal and less than or equal to FF: ${numberValue}`,
      start,
      end,
      loc
    )
  }
}

export class AddressError extends AssemblerError {
  constructor({ raw, start, end, loc }: Token) {
    const addressValue = trimBrackets(raw)
    super(
      `Expected a number or register: ${addressValue.length > 0 ? addressValue : ']'}`,
      start,
      end,
      loc
    )
  }
}

export class OperandTypeError extends AssemblerError {
  constructor({ raw, start, end, loc }: Token, ...expectedTypes: OperandType[]) {
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
    super(`Expected ${types}: ${raw}`, start, end, loc)
  }
}

export class MissingCommaError extends AssemblerError {
  constructor({ raw, start, end, loc }: Token) {
    super(`Expected comma: ${raw}`, start, end, loc)
  }
}

export class DuplicateLabelError extends AssemblerError {
  constructor({ identifier, start, end, loc }: Label) {
    super(`Duplicate label: ${identifier}`, start, end, loc)
  }
}

export class AssembleEndOfMemoryError extends AssemblerError {
  constructor({ start, end, loc }: Statement) {
    super('Can not generate code beyond the end of RAM', start, end, loc)
  }
}

export class LabelNotExistError extends AssemblerError {
  constructor({ raw, start, end, loc }: Operand) {
    super(`Label does not exist: ${raw}`, start, end, loc)
  }
}

export class JumpDistanceError extends AssemblerError {
  constructor({ raw, start, end, loc }: Operand) {
    super(`Jump distance should be between -128 and 127: ${raw}`, start, end, loc)
  }
}

export abstract class RuntimeError extends Error {
  public message: string

  constructor(message: string) {
    super()
    this.message = message
  }
}

export class InvalidRegisterError extends RuntimeError {
  constructor(value: number) {
    super(`Invalid register: ${value}`)
  }
}

export class RunBeyondEndOfMemory extends RuntimeError {
  constructor() {
    super('Can not execute code beyond the end of RAM')
  }
}

export class StackOverflowError extends RuntimeError {
  constructor() {
    super('Stack overflow')
  }
}

export class StackUnderflowError extends RuntimeError {
  constructor() {
    super('Stack underflow')
  }
}

export class DivideByZeroError extends RuntimeError {
  constructor() {
    super('Can not divide by zero')
  }
}

export class PortError extends RuntimeError {
  constructor() {
    super('I/O ports between 0 and F are available.')
  }
}
