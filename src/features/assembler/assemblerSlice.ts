import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'

import type { AddressToStatementMap, AssemblerErrorObject, SourceRange } from './core'

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
      state.addressToStatementMap = action.payload.addressToStatementMap
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
})

export const selectAssembledSource = (state: RootState): string => state.assembler.source

export const selectIsAssembled = (state: RootState): boolean =>
  state.assembler.source !== initialState.source

export const selectAddressToStatementMap = (state: RootState): Partial<AddressToStatementMap> =>
  state.assembler.addressToStatementMap

export const selectAssemblerError = (state: RootState): AssemblerErrorObject | null =>
  state.assembler.error

export const selectAssemblerErrorRange = (state: RootState): SourceRange | undefined =>
  state.assembler.error?.range

export const {
  setState: setAssemblerState,
  setError: setAssemblerError,
  clearError: clearAssemblerError,
  resetState: resetAssemblerState,
} = assemblerSlice.actions

export default assemblerSlice.reducer
