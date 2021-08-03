import type { Token } from './tokenizer'
import { TokenType } from './tokenizer'
import type { Label, OperandType, Statement } from './parser'
import { normalizeType } from '../utils'

export abstract class AssemblerError extends Error {
  public position: number
  public length: number

  constructor(msg: string, position: number, length: number) {
    super(msg)
    this.position = position
    this.length = length
  }
}

const getOriginalValue = (token: Token): string => {
  switch (token.type) {
    case TokenType.Address:
      return `[${token.value}]`
    case TokenType.String:
      return `"${token.value}"`
    default:
      return token.value
  }
}

export class StatementError extends AssemblerError {
  constructor(token: Token) {
    super(`Expected instruction or label: ${getOriginalValue(token)}`, token.position, token.length)
  }
}

export class InvalidLabelError extends AssemblerError {
  constructor(token: Token) {
    const identifier = token.value.endsWith(':') ? token.value.slice(0, -1) : token.value
    super(
      `Label should start with a charactor or underscore: ${identifier}`,
      token.position,
      identifier.length
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
    super(
      `Number should be hexadecimal and less than or equal to FF: ${token.value}`,
      token.position,
      token.length
    )
  }
}

export class AddressError extends AssemblerError {
  constructor(token: Token) {
    super(
      `Expected a number or register: ${token.value.length > 0 ? token.value : ']'}`,
      token.position + /* opening bracket */ 1,
      token.value.length > 0 ? token.value.length : 1
    )
  }
}

export class OperandTypeError extends AssemblerError {
  constructor(token: Token, ...expectedTypes: OperandType[]) {
    const types = expectedTypes
      .map(t => normalizeType(t))
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
    super(`Expected ${types}: ${getOriginalValue(token)}`, token.position, token.length)
  }
}

export class MissingCommaError extends AssemblerError {
  constructor(token: Token) {
    super(`Expected comma: ${getOriginalValue(token)}`, token.position, token.length)
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
    super(`Label does not exist: ${token.value}`, token.position, token.length)
  }
}

export class JumpDistanceError extends AssemblerError {
  constructor(token: Token) {
    super(
      `Jump distance should be between -128 and 127: ${token.value}`,
      token.position,
      token.length
    )
  }
}
