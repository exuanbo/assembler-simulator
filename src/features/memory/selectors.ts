import { createSelector } from '@reduxjs/toolkit'

import { chunk } from '@/common/utils'
import { selectAddressToStatementMap } from '@/features/assembler/assemblerSlice'

import { getSourceFrom } from './core'

export const selectMemorySourceRows = createSelector(
  selectAddressToStatementMap,
  (addressToStatementMap) => () => {
    const memorySource = getSourceFrom(addressToStatementMap)
    return chunk(0x10, memorySource)
  },
)
