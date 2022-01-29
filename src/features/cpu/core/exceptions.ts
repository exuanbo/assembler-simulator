import { decToHex } from '@/common/utils'

export interface RuntimeErrorObject {
  name: string
  message: string
}

export abstract class RuntimeError extends Error {
  public name = 'RuntimeError'

  // istanbul ignore next
  public toPlainObject(): RuntimeErrorObject {
    return {
      name: this.name,
      message: this.message
    }
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

export class InvalidOpcodeError extends RuntimeError {
  constructor(opcode: number) {
    super(`Invalid opcode '${decToHex(opcode)}'.`)
  }
}
