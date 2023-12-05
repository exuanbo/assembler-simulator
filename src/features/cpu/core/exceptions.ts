import { type ErrorObject, errorToPlainObject } from '@/common/error'
import { decToHex } from '@/common/utils'

export interface RuntimeErrorObject extends ErrorObject {}

export abstract class RuntimeError extends Error {
  public override name = 'RuntimeError'

  // istanbul ignore next
  public toPlainObject(): RuntimeErrorObject {
    return errorToPlainObject(this)
  }
}

export class InvalidRegisterError extends RuntimeError {
  constructor(value: number) {
    super(`Invalid register '${decToHex(value)}'.`)
  }
}

export class RunBeyondEndOfMemoryError extends RuntimeError {
  constructor() {
    super('Can not execute code beyond the end of RAM.')
  }
}

export class StackOverflowError extends RuntimeError {
  constructor() {
    super('Stack overflow.')
  }
}

export class StackUnderflowError extends RuntimeError {
  constructor() {
    super('Stack underflow.')
  }
}

export class DivideByZeroError extends RuntimeError {
  constructor() {
    super('Can not divide by zero.')
  }
}

export class InvalidPortError extends RuntimeError {
  constructor(port: number) {
    super(`I/O ports between 0 and F are available, got '${decToHex(port)}'.`)
  }
}

export class InvalidInputDataError extends RuntimeError {
  constructor(content: number) {
    super(`Input data '${decToHex(content)}' is greater than FF.`)
  }
}

export class InvalidOpcodeError extends RuntimeError {
  constructor(opcode: number) {
    super(`Invalid opcode '${decToHex(opcode)}'.`)
  }
}
