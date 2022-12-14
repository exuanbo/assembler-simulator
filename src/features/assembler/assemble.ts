import type { Store } from '@/app/store'
import { AssembleResult, AssemblerError, assemble as assemblePure } from './core'
import { setAssemblerState, setAssemblerError } from './assemblerSlice'
import { setMemoryDataFrom } from '@/features/memory/memorySlice'
import { resetCpuState } from '@/features/cpu/cpuSlice'
import { setEditorHighlightRange, clearEditorHighlightRange } from '@/features/editor/editorSlice'
import { setException } from '@/features/exception/exceptionSlice'

type Assemble = (input: string) => void

export const createAssemble = (store: Store): Assemble => {
  const assemble: Assemble = input => {
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
  return assemble
}
