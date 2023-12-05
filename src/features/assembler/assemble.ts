import { store } from '@/app/store'
import { resetCpuState } from '@/features/cpu/cpuSlice'
import { clearEditorHighlightRange, setEditorHighlightRange } from '@/features/editor/editorSlice'
import { setException } from '@/features/exception/exceptionSlice'
import { resetMemoryData, setMemoryDataFrom } from '@/features/memory/memorySlice'

import { resetAssemblerState, setAssemblerError, setAssemblerState } from './assemblerSlice'
import { assemble as assemblePure, AssemblerError, type AssembleResult } from './core'

export const assemble = (input: string): void => {
  let assembleResult: AssembleResult
  try {
    assembleResult = assemblePure(input)
  } catch (exception) {
    if (exception instanceof AssemblerError) {
      const assemblerErrorObject = exception.toPlainObject()
      store.dispatch(setAssemblerError(assemblerErrorObject))
    } else {
      store.dispatch(setException(exception))
      store.dispatch(resetAssemblerState())
    }
    return
  } finally {
    store.dispatch(resetCpuState())
    store.dispatch(resetMemoryData())
    store.dispatch(clearEditorHighlightRange())
  }
  const [addressToOpcodeMap, addressToStatementMap] = assembleResult
  store.dispatch(setAssemblerState({ source: input, addressToStatementMap }))
  store.dispatch(setMemoryDataFrom(addressToOpcodeMap))
  const firstStatement = addressToStatementMap[0]
  const hasStatement = firstStatement !== undefined
  if (hasStatement) {
    store.dispatch(setEditorHighlightRange(firstStatement))
  }
}
