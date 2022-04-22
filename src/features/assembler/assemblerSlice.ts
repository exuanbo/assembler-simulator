import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import type { AddressToStatementMap, AssemblerErrorObject, SourceRange } from './core'
import type { RootState } from '@/app/store'

interface AssemblerState {
  source: string
  addressToStatementMap: AddressToStatementMap
  error: AssemblerErrorObject | null
}

const initialState: AssemblerState = {
  source: '',
  addressToStatementMap: {},
  error: null
}

export const assemblerSlice = createSlice({
  name: 'assembler',
  initialState,
  reducers: {
    setState: (
      state,
      action: PayloadAction<{ source: string; addressToStatementMap: AddressToStatementMap }>
    ) => {
      state.source = action.payload.source
      state.addressToStatementMap = action.payload.addressToStatementMap
      state.error = null
    },
    setError: (state, action: PayloadAction<AssemblerErrorObject>) => {
      state.source = ''
      state.addressToStatementMap = {}
      state.error = action.payload
    },
    clearError: state => {
      state.error = null
    },
    resetState: () => initialState
  }
})

export const selectAssembledSource = (state: RootState): string => state.assembler.source

export const selectAddressToStatementMap = (state: RootState): AddressToStatementMap =>
  state.assembler.addressToStatementMap

export const selectAssemblerError = (state: RootState): AssemblerErrorObject | null =>
  state.assembler.error

export const selectAssemblerErrorRange = (state: RootState): SourceRange | undefined =>
  state.assembler.error?.range

export const {
  setState: setAssemblerState,
  setError: setAssemblerError,
  clearError: clearAssemblerError,
  resetState: resetAssemblerState
} = assemblerSlice.actions

export default assemblerSlice.reducer
