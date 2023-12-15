import { store } from '@/app/store'
import { setException } from '@/features/exception/exceptionSlice'
import { initMemoryDataFrom } from '@/features/memory/memorySlice'

import { resetAssemblerState, setAssemblerError, setAssemblerState } from './assemblerSlice'
import { assemble as assemblePure, AssemblerError, type AssembleResult } from './core'

export const assemble = (source: string): void => {
  let assembleResult: AssembleResult
  try {
    assembleResult = assemblePure(source)
  } catch (exception) {
    if (exception instanceof AssemblerError) {
      const assemblerErrorObject = exception.toPlainObject()
      store.dispatch(setAssemblerError(assemblerErrorObject))
    } else {
      store.dispatch(setException(exception))
      store.dispatch(resetAssemblerState())
    }
    return
  }
  const [addressToCodeMap, addressToStatementMap] = assembleResult
  store.dispatch(setAssemblerState({ source, addressToStatementMap }))
  store.dispatch(initMemoryDataFrom(addressToCodeMap))
}
