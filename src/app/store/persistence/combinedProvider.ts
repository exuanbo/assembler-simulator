import { merge, type PlainObject } from '@/common/utils'

import { localStorageProvider } from './providers/localStorage'
import { queryParamProvider } from './providers/queryParam'
import type { PersistenceProvider } from './types'

export const getCombinedProvider = <State extends PlainObject>(): PersistenceProvider<State> => {
  const providers: PersistenceProvider<State>[] = [localStorageProvider, queryParamProvider]
  return {
    read: () => providers.reduce((result, provider) => merge(result, provider.read()), {}),
    write: (state) => providers.forEach((provider) => provider.write(state)),
  }
}
