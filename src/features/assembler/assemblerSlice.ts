import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { AddressToStatementMap, AssemblerErrorObject } from './core'

interface AssemblerState {
  error: AssemblerErrorObject | null
  source: string
  addressToStatementMap: Partial<AddressToStatementMap>
}

const initialState: AssemblerState = {
  error: null,
  source: '',
  addressToStatementMap: {},
}

export const assemblerSlice = createSlice({
  name: 'assembler',
  initialState,
  reducers: {
    setState: (
      state,
      action: PayloadAction<{
        source: string
        addressToStatementMap: Partial<AddressToStatementMap>
      }>,
    ) => {
      state.error = null
      state.source = action.payload.source
      state.addressToStatementMap = Object.freeze(action.payload.addressToStatementMap)
    },
    setError: (state, action: PayloadAction<AssemblerErrorObject>) => {
      state.error = action.payload
      state.source = ''
      state.addressToStatementMap = {}
    },
    clearError: (state) => {
      state.error = null
    },
    resetState: () => initialState,
  },
  selectors: {
    selectAssembledSource: (state) => state.source,
    selectAddressToStatementMap: (state) => state.addressToStatementMap,
    selectAssemblerError: (state) => state.error,
    selectAssemblerErrorRange: (state) => state.error?.range,
  },
})

export const {
  setState: setAssemblerState,
  setError: setAssemblerError,
  clearError: clearAssemblerError,
  resetState: resetAssemblerState,
} = assemblerSlice.actions

export const {
  selectAssembledSource,
  selectAddressToStatementMap,
  selectAssemblerError,
  selectAssemblerErrorRange,
} = assemblerSlice.selectors
