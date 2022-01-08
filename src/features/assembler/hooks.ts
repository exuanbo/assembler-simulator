// TODO: remove batch from React 18
import { batch } from 'react-redux'
import { getState, dispatch } from '../../app/store'
import { Statement, AssembleResult, assemble as __assemble } from './core'
import { AssemblerError } from './core/exceptions'
import { setAssemblerState, setAssemblerError } from './assemblerSlice'
import { setMemoryDataFrom } from '../memory/memorySlice'
import { resetCpu } from '../cpu/cpuSlice'
import {
  selectEditortInput,
  setEditorActiveRange,
  clearEditorActiveRange
} from '../editor/editorSlice'

type Assemble = (input: string) => void

const assemble: Assemble = input => {
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
      return
    }
    // TODO: handle unexpected assemble errors
    throw err
  }
  const [addressToOpcodeMap, addressToStatementMap] = assembleResult
  batch(() => {
    dispatch(setMemoryDataFrom(addressToOpcodeMap))
    dispatch(resetCpu())
    dispatch(setAssemblerState(addressToStatementMap))
    const firstStatement = addressToStatementMap[0] as Statement | undefined
    dispatch(
      firstStatement === undefined ? clearEditorActiveRange() : setEditorActiveRange(firstStatement)
    )
  })
}

type AssembleInputFromState = () => void

const assembleInputFromState: AssembleInputFromState = () => {
  assemble(selectEditortInput(getState()))
}

interface UseAssemblerHook {
  (option?: { inputFromState?: false }): Assemble
  (option?: { inputFromState: true }): AssembleInputFromState
}

export const useAssembler = (({ inputFromState = false } = {}) =>
  inputFromState ? assembleInputFromState : assemble) as UseAssemblerHook
