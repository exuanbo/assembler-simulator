import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initMemory, initMemoryFrom } from '../../core'
import type { AddressToMachineCodeMap } from '../../core/assembler'
import type { RootState } from '../../app/store'

interface MemoryState {
  data: number[]
}

const initialState: MemoryState = {
  data: initMemory()
}

export const memorySlice = createSlice({
  name: 'memory',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<AddressToMachineCodeMap>) => {
      state.data = initMemoryFrom(action.payload)
    }
  }
})

export const selectMemoryData = (state: RootState): number[] => state.memory.data

export const { setData } = memorySlice.actions

export default memorySlice.reducer
