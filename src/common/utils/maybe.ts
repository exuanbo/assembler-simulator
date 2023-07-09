/* eslint-disable no-sequences */

import { Nullable } from './types'

export interface Maybe<T> {
  isJust: () => boolean
  isNothing: () => boolean
  map: <U>(f: (value: T) => U) => Maybe<U>
  chain: <U>(f: (value: T) => Maybe<U>) => Maybe<U>
  orDefault: (defaultValue: T) => T
  extract: () => T | undefined
  extractNullable: () => T | null
  ifJust: (f: (value: T) => void) => this
  ifNothing: (f: () => void) => this
}

export const just = <T>(value: T): Maybe<T> => {
  const instance: Maybe<T> = {
    isJust: () => true,
    isNothing: () => false,
    map: f => just(f(value)),
    chain: f => f(value),
    orDefault: () => value,
    extract: () => value,
    extractNullable: () => value,
    ifJust: f => (f(value), instance),
    ifNothing: () => instance
  }
  return instance
}

export const nothing = <T>(): Maybe<T> => {
  const instance: Maybe<T> = {
    isJust: () => false,
    isNothing: () => true,
    map: () => nothing(),
    chain: () => nothing(),
    orDefault: defaultValue => defaultValue,
    extract: () => undefined,
    extractNullable: () => null,
    ifJust: () => instance,
    ifNothing: f => (f(), instance)
  }
  return instance
}

type MaybeNullable = <T>(value: Nullable<T>) => Maybe<T>

export const maybeNullable: MaybeNullable = value => (value == null ? nothing() : just(value))
