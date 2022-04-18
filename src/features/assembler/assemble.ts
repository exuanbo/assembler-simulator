import type { Store } from '@/app/store'
import { Statement, AssembleResult, AssemblerError, assemble as __assemble } from './core'
import { setAssemblerState, setAssemblerError } from './assemblerSlice'
import { setMemoryDataFrom } from '@/features/memory/memorySlice'
import { resetCpu } from '@/features/cpu/cpuSlice'
import {
  selectEditorInput,
  setEditorActiveRange,
  clearEditorActiveRange
} from '@/features/editor/editorSlice'
import { setUnexpectedError } from '@/features/unexpectedError/unexpectedErrorSlice'
import { errorToPlainObject } from '@/common/utils'

export const createAssemble =
  (store: Store) =>
  (input = selectEditorInput(store.getState())): void => {
    let assembleResult: AssembleResult
    try {
      assembleResult = __assemble(input)
    } catch (err) {
      if (err instanceof AssemblerError) {
        const assemblerError = err.toPlainObject()
        store.dispatch(clearEditorActiveRange())
        store.dispatch(setAssemblerError(assemblerError))
      } else {
        const unexpectedError = errorToPlainObject(err as Error)
        store.dispatch(setUnexpectedError(unexpectedError))
      }
      return
    }
    const [addressToOpcodeMap, addressToStatementMap] = assembleResult
    const statement = addressToStatementMap[0] as Statement | undefined
    const hasStatement = statement !== undefined
    store.dispatch(setMemoryDataFrom(addressToOpcodeMap))
    store.dispatch(resetCpu())
    store.dispatch(setAssemblerState({ source: input, addressToStatementMap }))
    store.dispatch(hasStatement ? setEditorActiveRange(statement) : clearEditorActiveRange())
  }
