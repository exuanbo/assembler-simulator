import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initData, initDataFrom } from './core'
import type { AddressToMachineCodeMap } from '../assembler/core'
import type { RootState } from '../../app/store'

interface MemoryState {
  initialData: number[]
  data: number[]
}

const initialData = initData()

const initialState: MemoryState = {
  initialData,
  data: initialData
}

export const memorySlice = createSlice({
  name: 'memory',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<number[]>) => {
      state.data = action.payload
    },
    setDataFrom: (state, action: PayloadAction<AddressToMachineCodeMap>) => {
      const data = initDataFrom(action.payload)
      state.initialData = data
      state.data = data
    },
    reset: state => {
      state.data = state.initialData
    }
  }
})

export const selectMemoryData = (state: RootState): number[] => state.memory.data

export const {
  setData: setMemoryData,
  setDataFrom: setMemoryDataFrom,
  reset: resetMemory
} = memorySlice.actions

export default memorySlice.reducer
