import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { init, initFrom } from './core'
import type { AddressToMachineCodeMap } from '../assembler/core'
import type { RootState } from '../../app/store'

interface MemoryState {
  data: number[]
}

const initialState: MemoryState = {
  data: init()
}

export const memorySlice = createSlice({
  name: 'memory',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<AddressToMachineCodeMap>) => {
      state.data = initFrom(action.payload)
    }
  }
})

export const selectMemoryData = (state: RootState): number[] => state.memory.data

export const { setData } = memorySlice.actions

export default memorySlice.reducer
