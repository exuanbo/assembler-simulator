import type { Store, StoreEnhancer } from '@reduxjs/toolkit'

export const injectStoreExtension =
  <StoreExtension extends {}>(
    createExtension: <NextStore extends Store>(store: NextStore) => StoreExtension,
  ): StoreEnhancer<StoreExtension> =>
  (next) =>
  (...args) => {
    const store = next(...args)
    return {
      ...store,
      ...createExtension(store),
    }
  }
