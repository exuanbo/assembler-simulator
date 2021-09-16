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
