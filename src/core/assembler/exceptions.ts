import type { Token } from './tokenizer'
import type { OperandType } from './parser'
import { normalizeType } from '../utils'

export abstract class AssembleError extends Error {
  constructor(msg: string, public position: number, public length: number) {
    super(msg)
  }
}

export class StatementError extends AssembleError {
  constructor(token: Token) {
    super(
      `Expected instruction or label: ${token.getOriginalValue()}`,
      token.position,
      token.length
    )
  }
}

export class InvalidLabelError extends AssembleError {
  constructor(token: Token) {
    const identifier = token.value.endsWith(':') ? token.value.slice(-1) : token.value
    super(
      `Label should start with a charactor or _: ${identifier}`,
      token.position,
      identifier.length
    )
  }
}

export class MissingEndError extends AssembleError {
  constructor() {
    super('Expected END at the end of the source code', 0, 0)
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

export class AddressError extends AssembleError {
  constructor(token: Token) {
    super(`Expected a number or register: ${token.value}`, token.position + 1, token.length - 1)
  }
}

export class OperandTypeError extends AssembleError {
  constructor(token: Token, ...expectedTypes: OperandType[]) {
    const types = expectedTypes.map(t => normalizeType(t)).join(' or ')
    super(`Expected ${types}: ${token.getOriginalValue()}`, token.position, token.length)
  }
}

export class MissingCommaError extends AssembleError {
  constructor(token: Token) {
    super(`Expected ,: ${token.getOriginalValue()}`, token.position, token.length)
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
