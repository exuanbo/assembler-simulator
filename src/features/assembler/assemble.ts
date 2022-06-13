import type { Store } from '@/app/store'
import { AssembleResult, AssemblerError, assemble as __assemble } from './core'
import { setAssemblerState, setAssemblerError } from './assemblerSlice'
import { setMemoryDataFrom } from '@/features/memory/memorySlice'
import { resetCpuState } from '@/features/cpu/cpuSlice'
import {
  selectEditorInput,
  setEditorHighlightRange,
  clearEditorHighlightRange
} from '@/features/editor/editorSlice'
import { setException } from '@/features/exception/exceptionSlice'
import { errorToPlainObject } from '@/common/utils'

export type Assemble = (input?: string) => void

export const createAssemble =
  (store: Store): Assemble =>
  (input = selectEditorInput(store.getState())) => {
    let assembleResult: AssembleResult
    try {
      assembleResult = __assemble(input)
    } catch (err) {
      if (err instanceof AssemblerError) {
        const assemblerError = err.toPlainObject()
        store.dispatch(clearEditorHighlightRange())
        store.dispatch(setAssemblerError(assemblerError))
      } else {
        const errorObject = errorToPlainObject(err as Error)
        store.dispatch(setException(errorObject))
      }
      return
    }
    const [addressToOpcodeMap, addressToStatementMap] = assembleResult
    const firstStatement = addressToStatementMap[0]
    const hasStatement = firstStatement !== undefined
    store.dispatch(setMemoryDataFrom(addressToOpcodeMap))
    store.dispatch(resetCpuState())
    store.dispatch(setAssemblerState({ source: input, addressToStatementMap }))
    store.dispatch(
      hasStatement ? setEditorHighlightRange(firstStatement) : clearEditorHighlightRange()
    )
  }
