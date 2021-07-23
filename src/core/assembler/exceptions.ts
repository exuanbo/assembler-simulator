import { Token } from './tokenizer'
import { OperandType, normalizeOperandType } from './parser'

export abstract class AssembleError extends Error {
  constructor(msg: string, public position: number, public length: number) {
    super(msg)
  }
}

export class StatementError extends AssembleError {
  constructor(token: Token) {
    super(
      `Expected instruction or label: ${Token.getOriginalValue(token)}`,
      token.position,
      token.length
    )
  }
}

export class InvalidLabelError extends AssembleError {
  constructor(identifier: string, position: number) {
    super(`Label should start with a charactor or _: ${identifier}`, position, identifier.length)
  }
}

export class MissingEndError extends AssembleError {
  constructor() {
    super('Expected END at the end of the source code', 0, 0)
  }
}

export class AddressError extends AssembleError {
  constructor(token: Token) {
    super(`Expected a number or register: ${token.value}`, token.position + 1, token.length - 1)
  }
}

export class InvalidNumberError extends AssembleError {
  constructor(token: Token) {
    super(
      `Number should be hexadecimal and less than 256: ${token.value}`,
      token.position,
      token.length
    )
  }
}

export class OperandTypeError extends AssembleError {
  constructor(token: Token, ...expectedTypes: OperandType[]) {
    const types = expectedTypes.map(t => normalizeOperandType(t)).join(' or ')
    super(`Expected ${types}: ${Token.getOriginalValue(token)}`, token.position, token.length)
  }
}

export class MissingCommaError extends AssembleError {
  constructor(token: Token) {
    super(`Expected ,: ${Token.getOriginalValue(token)}`, token.position, token.length)
  }
}

export class DuplicateLabelError extends AssembleError {
  constructor(identifier: string, position: number) {
    super(`Duplicate label: ${identifier}`, position, identifier.length)
  }
}

export class LabelNotExistError extends AssembleError {
  constructor(identifier: string, position: number) {
    super(`Label does not exist: ${identifier}`, position, identifier.length)
  }
}
