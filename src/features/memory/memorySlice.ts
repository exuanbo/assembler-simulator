import { PayloadAction, createSlice, createSelector } from '@reduxjs/toolkit'
import { MemoryData, VDU_START_ADDRESS, initData, initDataFrom, getSourceFrom } from './core'
import type { AddressToMachineCodeMap } from '../assembler/core'
import type { RootState } from '../../app/store'
import { selectAddressToStatementMap } from '../assembler/assemblerSlice'
import { chunk } from '../../common/utils'

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

export const selectVduBuffer = createSelector(selectMemoryData, memoryData =>
  memoryData.slice(VDU_START_ADDRESS)
)

export const selectMemoryDataRowsGetter = createSelector(
  selectMemoryData,
  memoryData => () => chunk(0x10, memoryData)
)

export const selectMemorySourceRowsGetter = createSelector(
  selectAddressToStatementMap,
  addressToStatementMap => () => {
    const memorySource = getSourceFrom(addressToStatementMap)
    return chunk(0x10, memorySource)
  }
)

export const {
  setData: setMemoryData,
  setDataFrom: setMemoryDataFrom,
  reset: resetMemory
} = memorySlice.actions

export default memorySlice.reducer
