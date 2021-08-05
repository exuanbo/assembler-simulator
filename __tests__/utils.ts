import { AssemblerError, RuntimeError } from '../src/core/exceptions'

export const expectError = (cb: () => void, msg: string): void => {
  try {
    cb()
    throw new Error(`Expected error with message: ${msg}`)
  } catch (err) {
    if (err instanceof AssemblerError || err instanceof RuntimeError) {
      expect(err.message).toBe(msg)
    } else {
      throw err
    }
  }
}
