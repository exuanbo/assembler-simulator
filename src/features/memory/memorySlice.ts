import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { chunk } from '@/common/utils'
import type { AddressToCodeMap } from '@/features/assembler/core'

import { initData, initDataFrom, type MemoryData } from './core'

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

const createTypedStateSelector = createSelector.withTypes<MemoryState>()

export const memorySlice = createSlice({
  name: 'memory',
  initialState,
  reducers: {
    initDataFrom: (state, action: PayloadAction<AddressToCodeMap>) => {
      state.data = initDataFrom(action.payload)
    },
    setData: (state, action: PayloadAction<MemoryData>) => {
      state.data = action.payload
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
    selectMemoryDataRows: createTypedStateSelector(
      [(state) => state.data],
      (memoryData) => () => chunk(0x10, memoryData),
    ),
    selectMemoryView: (state) => state.view,
  },
})

export const {
  initDataFrom: initMemoryDataFrom,
  setData: setMemoryData,
  resetData: resetMemoryData,
  setView: setMemoryView,
} = memorySlice.actions

export const { selectMemoryData, selectMemoryDataRows, selectMemoryView } = memorySlice.selectors
