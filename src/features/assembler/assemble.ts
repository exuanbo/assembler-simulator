// TODO: remove batch from React 18
import { batch } from 'react-redux'
import { getState, dispatch } from '@/app/store'
import { Statement, AssembleResult, AssemblerError, assemble as __assemble } from './core'
import { setAssemblerState, setAssemblerError } from './assemblerSlice'
import { setMemoryDataFrom } from '@/features/memory/memorySlice'
import { resetCpu } from '@/features/cpu/cpuSlice'
import {
  selectEditortInput,
  setEditorActiveRange,
  clearEditorActiveRange
} from '@/features/editor/editorSlice'
import { setUnexpectedError } from '@/features/unexpectedError/unexpectedErrorSlice'
import { errorToPlainObject } from '@/common/utils'

export const assemble = (input: string): void => {
  let assembleResult: AssembleResult
  try {
    assembleResult = __assemble(input)
  } catch (err) {
    if (err instanceof AssemblerError) {
      const assemblerError = err.toPlainObject()
      batch(() => {
        dispatch(clearEditorActiveRange())
        dispatch(setAssemblerError(assemblerError))
      })
    } else {
      const unexpectedError = errorToPlainObject(err as Error)
      dispatch(setUnexpectedError(unexpectedError))
    }
    return
  }
  const [addressToOpcodeMap, addressToStatementMap] = assembleResult
  const statement = addressToStatementMap[0] as Statement | undefined
  batch(() => {
    dispatch(setMemoryDataFrom(addressToOpcodeMap))
    dispatch(resetCpu())
    dispatch(setAssemblerState(addressToStatementMap))
    dispatch(statement === undefined ? clearEditorActiveRange() : setEditorActiveRange(statement))
  })
}

export const assembleInputFromState = (): void => {
  assemble(selectEditortInput(getState()))
}
