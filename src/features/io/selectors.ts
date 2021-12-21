import { createSelector } from '@reduxjs/toolkit'
import { selectMemoryData } from '../memory/memorySlice'

export const selectVduBuffer = createSelector(selectMemoryData, memoryData =>
  memoryData.slice(0xc0)
)
