import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AddressToStatementMap } from './core'
import type { IAssemblerError } from './core/exceptions'
import type { RootState } from '../../app/store'
import type { SourceRange } from '../assembler/core/types'

interface AssemblerState {
  addressToStatementMap: AddressToStatementMap
  error: IAssemblerError | null
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
    setError: (state, action: PayloadAction<IAssemblerError>) => {
      state.addressToStatementMap = {}
      state.error = action.payload
    }
  }
})

export const selectAddressToStatementMap = (state: RootState): AddressToStatementMap =>
  state.assembler.addressToStatementMap

export const selectAssemblerErrorMessage = (state: RootState): string | undefined =>
  state.assembler.error?.message

export const selectAssemblerErrorRange = (state: RootState): SourceRange | undefined =>
  state.assembler.error?.range

export const { setState: setAssemblerState, setError: setAssemblerError } = assemblerSlice.actions

export default assemblerSlice.reducer
