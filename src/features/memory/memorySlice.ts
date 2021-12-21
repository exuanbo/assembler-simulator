import { PayloadAction, createSlice, createSelector } from '@reduxjs/toolkit'
import { MemoryData, initData, initDataFrom, getSourceFrom } from './core'
import type { AddressToMachineCodeMap } from '../assembler/core'
import type { RootState } from '../../app/store'
import { selectAddressToStatementMap } from '../assembler/assemblerSlice'
import { splitArrayPerChunk } from '../../common/utils'

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

export const selectMemoryDataRows = createSelector(selectMemoryData, memoryData =>
  splitArrayPerChunk(memoryData, 0x10)
)

export const selectMemorySourceRows = createSelector(
  selectAddressToStatementMap,
  addressToStatementMap => {
    const memorySource = getSourceFrom(addressToStatementMap)
    return splitArrayPerChunk(memorySource, 0x10)
  }
)

export const {
  setData: setMemoryData,
  setDataFrom: setMemoryDataFrom,
  reset: resetMemory
} = memorySlice.actions

export default memorySlice.reducer
