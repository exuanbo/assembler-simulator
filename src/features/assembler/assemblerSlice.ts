import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AddressToStatementMap } from './core'
import type { AssemblerError } from './core/exceptions'
import type { RootState } from '../../app/store'
import type { SourceRange } from '../assembler/core/types'

interface AssemblerState {
  addressToStatementMap: AddressToStatementMap
  error: AssemblerError | null
}

const initialState: AssemblerState = {
  addressToStatementMap: {},
  error: null
}

export const assemblerSlice = createSlice({
  name: 'assembler',
  initialState,
  reducers: {
    setState: (_state, action: PayloadAction<AssemblerState>) => action.payload
  }
})

export const selectAddressToStatementMap = (state: RootState): AddressToStatementMap =>
  state.assembler.addressToStatementMap

export const selectAssemblerErrorMessage = (state: RootState): string | undefined =>
  state.assembler.error?.message

export const selectAssemblerErrorRange = (state: RootState): SourceRange | undefined =>
  state.assembler.error?.range

export const { setState: setAssemblerState } = assemblerSlice.actions

export default assemblerSlice.reducer
