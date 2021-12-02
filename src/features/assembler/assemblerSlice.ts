import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AddressToStatementMap } from './core'
import type { AssemblerError } from './core/exceptions'
import type { RootState } from '../../app/store'
import type { SourceRange } from '../assembler/core/types'

type AssemblerState =
  | {
      addressToStatementMap: AddressToStatementMap
      error: null
    }
  | {
      addressToStatementMap: Record<string, never>
      error: AssemblerError
    }

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const initialState = {
  addressToStatementMap: {},
  error: null
} as AssemblerState

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
