import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AddressToStatementMap, AssemblerError } from './core'
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

export const selectAssemblerErrorMessage = (state: RootState): string | undefined =>
  state.assembler.error?.message

export const selectAssemblerErrorRange = (
  state: RootState
):
  | {
      from: number
      to: number
    }
  | undefined => {
  const assemblerError = state.assembler.error
  if (assemblerError?.range == null) {
    return undefined
  }
  const [from, to] = assemblerError.range
  return { from, to }
}

export const { setState: setAssemblerState } = assemblerSlice.actions

export default assemblerSlice.reducer
