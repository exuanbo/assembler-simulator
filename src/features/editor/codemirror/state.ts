import type { StateEffect } from '@codemirror/state'

export const mapStateEffectValue = <T, R>(effect: StateEffect<T>, fn: (value: T) => R): R => {
  return fn(effect.value)
}
