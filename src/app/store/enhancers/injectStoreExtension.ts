import type { StoreEnhancer } from '@reduxjs/toolkit'

export const injectStoreExtension =
  <StoreExtension extends {}>(extension: StoreExtension): StoreEnhancer<StoreExtension> =>
  (createStore) =>
  (...args) => {
    const store = createStore(...args)
    return {
      ...store,
      ...extension,
    }
  }
