import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { chunk } from '@/common/utils'
import { selectAddressToStatementMap } from '@/features/assembler/assemblerSlice'
import type { AddressToCodeMap } from '@/features/assembler/core'

import { getSourceFrom, initData, initDataFrom, type MemoryData } from './core'

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
    setDataFrom: (state, action: PayloadAction<AddressToCodeMap>) => {
      state.data = initDataFrom(action.payload)
    },
    resetData: (state) => {
      state.data = initialData
    },
    setView: (state, action: PayloadAction<MemoryView>) => {
      state.view = action.payload
    },
  },
  selectors: {
    selectMemoryData: (state) => state.data,
    selectMemoryDataRows: createSelector(
      (state: MemoryState) => state.data,
      (memoryData) => () => chunk(0x10, memoryData),
    ),
    selectMemoryView: (state) => state.view,
  },
})

export const {
  setData: setMemoryData,
  setDataFrom: setMemoryDataFrom,
  resetData: resetMemoryData,
  setView: setMemoryView,
} = memorySlice.actions

export const { selectMemoryData, selectMemoryDataRows, selectMemoryView } = memorySlice.selectors

export const selectMemorySourceRows = createSelector(
  selectAddressToStatementMap,
  (addressToStatementMap) => () => {
    const memorySource = getSourceFrom(addressToStatementMap)
    return chunk(0x10, memorySource)
  },
)
