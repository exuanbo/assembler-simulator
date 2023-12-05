import type { Nullable } from './utils/types'

export interface Maybe<T extends {}> {
  isJust: () => boolean
  isNothing: () => boolean
  map: <U extends {}>(f: (value: T) => U) => Maybe<U>
  chain: <U extends {}>(f: (value: T) => Maybe<U>) => Maybe<U>
  orDefault: <U>(defaultValue: U) => T | U
  extract: () => T | undefined
  extractNullable: () => T | null
  ifJust: (f: (value: T) => void) => this
  ifNothing: (f: () => void) => this
}

export const just = <T extends {}>(value: T): Maybe<T> => {
  const instance: Maybe<T> = {
    isJust: () => true,
    isNothing: () => false,
    map: (f) => just(f(value)),
    chain: (f) => f(value),
    orDefault: () => value,
    extract: () => value,
    extractNullable: () => value,
    ifJust: (f) => (f(value), instance),
    ifNothing: () => instance,
  }
  return instance
}

export const nothing = <T extends {}>(): Maybe<T> => {
  const instance: Maybe<T> = {
    isJust: () => false,
    isNothing: () => true,
    map: () => nothing(),
    chain: () => nothing(),
    orDefault: (defaultValue) => defaultValue,
    extract: () => undefined,
    extractNullable: () => null,
    ifJust: () => instance,
    ifNothing: (f) => (f(), instance),
  }
  return instance
}

type MaybeFromNullable = <T extends {}>(value: Nullable<T>) => Maybe<T>

export const fromNullable: MaybeFromNullable = (value) => (value ? just(value) : nothing())
