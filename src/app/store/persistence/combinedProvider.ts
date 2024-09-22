import { createLocalStorageProvider } from './providers/localStorage'
import { createQueryParamProvider } from './providers/queryParam'
import type { PersistenceProvider, PersistenceProviderCreator, PersistenceValidator } from './types'

const defaultProviderCreators = [createLocalStorageProvider, createQueryParamProvider]

export const createCombinedProvider = <State>(
  combine: (a: State, b: State) => State,
  providerCreators: PersistenceProviderCreator[] = defaultProviderCreators,
) =>
  (validate: PersistenceValidator<State>, fallback: State): PersistenceProvider<State> => {
    const providers = providerCreators.map((createProvider) => createProvider(validate, fallback))
    return {
      read: () => providers.map((provider) => provider.read()).reduce(combine),
      write: (state) => providers.forEach((provider) => provider.write(state)),
    }
  }
