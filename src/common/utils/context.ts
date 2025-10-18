// Modifed from Sukka's vanilla context implementation
// https://blog.skk.moe/post/context-in-javascript/
// CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh

import { invariant } from './invariant'

export interface Context<T> {
  get(): T
  run<R>(value: T, fn: () => R): R
  run(value: T): <R>(fn: () => R) => R
}

const NIL = Symbol('NIL')

export function createContext<T>(defaultValue: T | typeof NIL = NIL): Context<T> {
  let value = defaultValue

  function get() {
    invariant(value != NIL)
    return value
  }

  function run<R>(next: T, cb?: () => R) {
    if (!cb) {
      return (fn: typeof cb) => run(next, fn)
    }
    const prev = value
    value = next
    try {
      return cb()
    }
    finally {
      value = prev
    }
  }

  return {
    get,
    run,
  }
}

export type Executor = <R>(fn: () => R) => R

export function compose<R>(executors: Executor[], fn: () => R): R

export function compose<R>(executors: Executor[], cb: () => R) {
  const execute = executors.reduceRight(
    (composed, current) => (fn) => current(() => composed(fn)),
    (fn) => fn(),
  )
  return execute(cb)
}
