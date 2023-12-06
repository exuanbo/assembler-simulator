// Maybe monad implementation, API inspired by https://github.com/gigobyte/purify
// Reference documentation https://gigobyte.github.io/purify/adts/Maybe
// ISC licensed https://github.com/gigobyte/purify/blob/0840eb69b97617b09aca098f73948c61de563194/LICENSE

export interface IMaybe<T extends {}> {
  isJust: () => boolean
  isNothing: () => boolean
  map: <U extends {}>(f: (value: T) => U) => IMaybe<U>
  alt: (other: IMaybe<T>) => IMaybe<T>
  altLazy: (other: () => IMaybe<T>) => IMaybe<T>
  chain: <U extends {}>(f: (value: T) => IMaybe<U>) => IMaybe<U>
  orDefault: <U>(defaultValue: U) => T | U
  orDefaultLazy: <U>(getDefaultValue: () => U) => T | U
  filter: (pred: (value: T) => boolean) => IMaybe<T>
  extract: () => T | undefined
  extractNullable: () => T | null
  ifJust: (f: (value: T) => void) => this
  ifNothing: (f: () => void) => this
}

export type Maybe<T extends {}> = IMaybe<T>

export const Just = <T extends {}>(value: T): IMaybe<T> => {
  const instance: IMaybe<T> = {
    isJust: () => true,
    isNothing: () => false,
    map: (f) => Just(f(value)),
    alt: () => instance,
    altLazy: () => instance,
    chain: (f) => f(value),
    orDefault: () => value,
    orDefaultLazy: () => value,
    filter: (pred) => (pred(value) ? instance : Nothing),
    extract: () => value,
    extractNullable: () => value,
    ifJust: (f) => (f(value), instance),
    ifNothing: () => instance,
  }
  if (import.meta.env.DEV) {
    Object.freeze(instance)
  }
  return instance
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Nothing: IMaybe<any> = {
  isJust: () => false,
  isNothing: () => true,
  map: () => Nothing,
  alt: (other) => other,
  altLazy: (other) => other(),
  chain: () => Nothing,
  orDefault: (defaultValue) => defaultValue,
  orDefaultLazy: (getDefaultValue) => getDefaultValue(),
  filter: () => Nothing,
  extract: () => undefined,
  extractNullable: () => null,
  ifJust: () => Nothing,
  ifNothing: (f) => (f(), Nothing),
}

if (import.meta.env.DEV) {
  Object.freeze(Nothing)
}

type Nullish = null | undefined
type MaybeFromNullable = <T extends {}>(value: T | Nullish) => IMaybe<T>

export const fromNullable: MaybeFromNullable = (value) => (value != null ? Just(value) : Nothing)

type Falsy = Nullish | false | 0 | 0n | ''
type MaybeFromFalsy = <T extends {}>(value: T | Falsy) => IMaybe<T>

export const fromFalsy: MaybeFromFalsy = (value) => (value ? Just(value) : Nothing)
