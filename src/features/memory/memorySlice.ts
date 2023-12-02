import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'
import { chunk } from '@/common/utils'
import { selectAddressToStatementMap } from '@/features/assembler/assemblerSlice'
import type { AddressToMachineCodeMap } from '@/features/assembler/core'

import { getSourceFrom, initData, initDataFrom, MemoryData } from './core'

export enum MemoryView {
  Hexadecimal = 'Hexadecimal',
  Decimal = 'Decimal',
  Source = 'Source',
}

export const memoryViewOptions: readonly MemoryView[] = Object.values(MemoryView)

interface MemoryState {
  data: MemoryData
  view: MemoryView
}

const initialData = initData()

const initialState: MemoryState = {
  data: initialData,
  view: MemoryView.Hexadecimal,
}

export const memorySlice = createSlice({
  name: 'memory',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<MemoryData>) => {
      state.data = action.payload
    },
    setDataFrom: (state, action: PayloadAction<AddressToMachineCodeMap>) => {
      state.data = initDataFrom(action.payload)
    },
    resetData: (state) => {
      state.data = initialData
    },
    setView: (state, action: PayloadAction<MemoryView>) => {
      state.view = action.payload
    },
  },
})

export const selectMemoryData = (state: RootState): MemoryData => state.memory.data

export const selectMemoryDataRowsGetter = createSelector(
  selectMemoryData,
  (memoryData) => () => chunk(0x10, memoryData),
)

export const selectMemorySourceRowsGetter = createSelector(
  selectAddressToStatementMap,
  (addressToStatementMap) => () => {
    const memorySource = getSourceFrom(addressToStatementMap)
    return chunk(0x10, memorySource)
  },
)

export const selectMemoryView = (state: RootState): MemoryView => state.memory.view

export const {
  setData: setMemoryData,
  setDataFrom: setMemoryDataFrom,
  resetData: resetMemoryData,
  setView: setMemoryView,
} = memorySlice.actions

export default memorySlice.reducer
