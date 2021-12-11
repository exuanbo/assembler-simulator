import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { MemoryData, initData, initDataFrom } from './core'
import type { AddressToMachineCodeMap } from '../assembler/core'
import type { RootState } from '../../app/store'

interface MemoryState {
  data: MemoryData
}

const initialData = initData()

const initialState: MemoryState = {
  data: initialData
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
    reset: state => {
      state.data = initialData
    }
  }
})

export const selectMemoryData = (state: RootState): MemoryData => state.memory.data

export const {
  setData: setMemoryData,
  setDataFrom: setMemoryDataFrom,
  reset: resetMemory
} = memorySlice.actions

export default memorySlice.reducer
