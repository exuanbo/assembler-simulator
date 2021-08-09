import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AddressToStatementMap } from './core'
import type { AssemblerError } from '../../common/exceptions'
import type { RootState } from '../../app/store'

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

export const selectAssemblerError = (state: RootState): AssemblerError | null =>
  state.assembler.error

export const { setState } = assemblerSlice.actions

export default assemblerSlice.reducer
