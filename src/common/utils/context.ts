// Modifed from "在 JavaScript 中实现和使用 Context | Sukka's Blog"
// https://blog.skk.moe/post/context-in-javascript/
// CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh

export type ApplyProvider = <R>(callback: () => R) => R

export interface ContextProvider<T> {
  <R>(props: { value: T, callback: () => R }): R
  (props: { value: T }): ApplyProvider
}

export interface ContextConsumer<T> {
  <R>(callback: (value: T) => R): R
  (): T
}

export interface Context<T> {
  Provider: ContextProvider<T>
  Consumer: ContextConsumer<T>
}

const NO_VALUE_DEFAULT = Symbol('NO_VALUE_DEFAULT')
type ContextValue<T> = T | typeof NO_VALUE_DEFAULT

export function createContext<T>(defaultValue: ContextValue<T> = NO_VALUE_DEFAULT): Context<T> {
  let contextValue = defaultValue

  const Provider = <R>({ value, callback }: { value: T, callback?: () => R }) => {
    if (!callback) {
      return (fn: () => R) => Provider({ value, callback: fn })
    }
    const currentValue = contextValue
    contextValue = value
    try {
      return callback()
    }
    finally {
      contextValue = currentValue
    }
  }

  const Consumer = <R>(callback?: (value: T) => R) => {
    if (contextValue === NO_VALUE_DEFAULT) {
      throw new TypeError(
        'You should only use useContext inside a Provider, or provide a default value!',
      )
    }
    if (!callback) {
      return contextValue
    }
    return callback(contextValue)
  }

  return {
    Provider,
    Consumer,
  }
}

export function useContext<T>(contextRef: Context<T>): T {
  return contextRef.Consumer()
}

export interface ContextComposeProviderProps<R> {
  contexts: ApplyProvider[]
  callback: () => R
}

export function ComposeProvider<R>({ contexts, callback }: ContextComposeProviderProps<R>): R {
  const applyProviders = contexts.reduceRight(
    (composed, current) => (fn) => current(() => composed(fn)),
    (fn) => fn(),
  )
  return applyProviders(callback)
}
