import type { StoreEnhancer } from '@reduxjs/toolkit'

export const extendStore =
  <Ext extends {}>(extension: Ext): StoreEnhancer<Ext> =>
  (createStore) =>
  (...args) => {
    const store = createStore(...args)
    return {
      ...store,
      ...extension,
    }
  }
