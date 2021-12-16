import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import type { AddressToStatementMap } from './core'
import type { AssemblerErrorObject } from './core/exceptions'
import type { RootState } from '../../app/store'
import type { SourceRange } from '../assembler/core/types'

interface AssemblerState {
  addressToStatementMap: AddressToStatementMap
  error: AssemblerErrorObject | null
}

const initialState: AssemblerState = {
  addressToStatementMap: {},
  error: null
}

export const assemblerSlice = createSlice({
  name: 'assembler',
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<AddressToStatementMap>) => {
      state.addressToStatementMap = action.payload
      state.error = null
    },
    setError: (state, action: PayloadAction<AssemblerErrorObject>) => {
      state.addressToStatementMap = {}
      state.error = action.payload
    },
    reset: () => initialState
  }
})

export const selectAddressToStatementMap = (state: RootState): AddressToStatementMap =>
  state.assembler.addressToStatementMap

export const selectAssemblerError = (state: RootState): AssemblerErrorObject | null =>
  state.assembler.error

export const selectAssemblerErrorRange = (state: RootState): SourceRange | undefined =>
  state.assembler.error?.range

export const {
  setState: setAssemblerState,
  setError: setAssemblerError,
  reset: resetAssembler
} = assemblerSlice.actions

export default assemblerSlice.reducer
