import { createSelector } from '@reduxjs/toolkit'

import { selectAddressToStatementMap } from '@/features/assembler/assemblerSlice'
import { selectCpuInstructionPointerRegister } from '@/features/cpu/cpuSlice'
import { selectMemoryData } from '@/features/memory/memorySlice'

export const selectCurrentStatementRange = createSelector(
  selectAddressToStatementMap,
  selectCpuInstructionPointerRegister,
  selectMemoryData,
  (addressToStatementMap, ip, memoryData) => {
    const statement = addressToStatementMap[ip]
    if (
      statement &&
      statement.codes.length &&
      statement.codes.every((code, offset) => code === memoryData[ip + offset])
    ) {
      return statement.range
    }
    return null
  },
)
