import { createSelector } from '@reduxjs/toolkit'

import { selectAddressToStatementMap } from '@/features/assembler/assemblerSlice'
import { selectCpuInstructionPointerRegister } from '@/features/cpu/cpuSlice'
import { selectMemoryData } from '@/features/memory/memorySlice'

export const selectCurrentStatementRange = createSelector(
  selectCpuInstructionPointerRegister,
  selectAddressToStatementMap,
  selectMemoryData,
  (address, addressToStatementMap, memoryData) => {
    const statement = addressToStatementMap[address]
    if (
      statement &&
      statement.codes.length &&
      statement.codes.every((code, offset) => code === memoryData[address + offset])
    ) {
      return statement.range
    }
    return null
  },
)
