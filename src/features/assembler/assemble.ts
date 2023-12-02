import { store } from '@/app/store'
import { resetCpuState } from '@/features/cpu/cpuSlice'
import { clearEditorHighlightRange, setEditorHighlightRange } from '@/features/editor/editorSlice'
import { setException } from '@/features/exception/exceptionSlice'
import { setMemoryDataFrom } from '@/features/memory/memorySlice'

import { setAssemblerError, setAssemblerState } from './assemblerSlice'
import { assemble as assemblePure, AssemblerError, AssembleResult } from './core'

export const assemble = (input: string): void => {
  let assembleResult: AssembleResult
  try {
    assembleResult = assemblePure(input)
  } catch (exception) {
    if (exception instanceof AssemblerError) {
      const assemblerErrorObject = exception.toPlainObject()
      store.dispatch(setAssemblerError(assemblerErrorObject))
      store.dispatch(clearEditorHighlightRange())
    } else {
      store.dispatch(setException(exception))
    }
    return
  }
  const [addressToOpcodeMap, addressToStatementMap] = assembleResult
  store.dispatch(setAssemblerState({ source: input, addressToStatementMap }))
  store.dispatch(setMemoryDataFrom(addressToOpcodeMap))
  store.dispatch(resetCpuState())
  const firstStatement = addressToStatementMap[0]
  const hasStatement = firstStatement !== undefined
  if (hasStatement) {
    store.dispatch(setEditorHighlightRange(firstStatement))
  } else {
    store.dispatch(clearEditorHighlightRange())
  }
}
