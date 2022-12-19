export interface Maybe<T> {
  isJust: () => boolean
  isNothing: () => boolean
  map: <U>(f: (value: T) => U) => Maybe<U>
  chain: <U>(f: (value: T) => Maybe<U>) => Maybe<U>
  orDefault: (defaultValue: T) => T
  extract: () => T | undefined
  extractNullable: () => T | null
}

export const just = <T>(value: T): Maybe<T> => ({
  isJust: () => true,
  isNothing: () => false,
  map: f => just(f(value)),
  chain: f => f(value),
  orDefault: () => value,
  extract: () => value,
  extractNullable: () => value
})

export const nothing = <T>(): Maybe<T> => ({
  isJust: () => false,
  isNothing: () => true,
  map: () => nothing(),
  chain: () => nothing(),
  orDefault: defaultValue => defaultValue,
  extract: () => undefined,
  extractNullable: () => null
})

type MaybeNullable = <T>(value: T | null | undefined) => Maybe<T>

export const maybeNullable: MaybeNullable = value => (value == null ? nothing() : just(value))
