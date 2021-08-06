import type { Token, Label, OperandType, Statement } from './assembler'
import { trimBrackets } from './utils'

export abstract class AssemblerError extends Error {
  public position: number
  public length: number

  constructor(msg: string, position: number, length: number) {
    super(msg)
    this.position = position
    this.length = length
  }
}

export class StatementError extends AssemblerError {
  constructor(token: Token, hasLabel: boolean) {
    super(
      `Expected ${hasLabel ? '' : 'label or '}instruction: ${token.originalValue}`,
      token.position,
      token.length
    )
  }
}

export class InvalidLabelError extends AssemblerError {
  constructor(token: Token) {
    const identifier = token.originalValue.replace(/:$/, '')
    super(
      `Label should start with a charactor or underscore: ${identifier}`,
      token.position,
      identifier.length > 0 ? identifier.length : 1
    )
  }
}

export class MissingEndError extends AssemblerError {
  constructor() {
    super('Expected END at the end of the source code', 0, 0)
  }
}

export class InvalidNumberError extends AssemblerError {
  constructor(token: Token) {
    const numberValue = trimBrackets(token.originalValue)
    super(
      `Number should be hexadecimal and less than or equal to FF: ${numberValue}`,
      token.position,
      token.length
    )
  }
}

export class AddressError extends AssemblerError {
  constructor(token: Token) {
    const addressValue = trimBrackets(token.originalValue)
    super(
      `Expected a number or register: ${addressValue.length > 0 ? addressValue : ']'}`,
      token.position + /* opening bracket */ 1,
      addressValue.length > 0 ? addressValue.length : 1
    )
  }
}

export class OperandTypeError extends AssemblerError {
  constructor(token: Token, ...expectedTypes: OperandType[]) {
    const types = expectedTypes
      .map(type => type.toLowerCase().split('_').join(' '))
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
    super(`Expected ${types}: ${token.originalValue}`, token.position, token.length)
  }
}

export class MissingCommaError extends AssemblerError {
  constructor(token: Token) {
    super(`Expected comma: ${token.originalValue}`, token.position, token.length)
  }
}

export class DuplicateLabelError extends AssemblerError {
  constructor(label: Label) {
    super(`Duplicate label: ${label.identifier}`, label.token.position, label.identifier.length)
  }
}

export class EndOfMemoryError extends AssemblerError {
  constructor(statement: Statement) {
    super('Can not generate code beyond the end of RAM', statement.position, statement.length)
  }
}

export class LabelNotExistError extends AssemblerError {
  constructor(token: Token) {
    super(`Label does not exist: ${token.originalValue}`, token.position, token.length)
  }
}

export class JumpDistanceError extends AssemblerError {
  constructor(token: Token) {
    super(
      `Jump distance should be between -128 and 127: ${token.originalValue}`,
      token.position,
      token.length
    )
  }
}

export abstract class RuntimeError extends Error {}

export class InvalidRegisterError extends RuntimeError {
  constructor(value: number) {
    super(`Invalid register: ${value}`)
  }
}
