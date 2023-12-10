import { getLocalStorageProvider } from './providers/localStorage'
import { getQueryParamProvider } from './providers/queryParam'
import type { PersistenceProvider, PersistenceValidator } from './types'

export const getCombinedProvider =
  <State>(combine: (a: State, b: State) => State) =>
  (validate: PersistenceValidator<State>, fallback: State): PersistenceProvider<State> => {
    const providers = [
      getLocalStorageProvider(validate, fallback),
      getQueryParamProvider(validate, fallback),
    ]
    return {
      read: () => providers.map((provider) => provider.read()).reduce(combine),
      write: (state) => providers.forEach((provider) => provider.write(state)),
    }
  }
