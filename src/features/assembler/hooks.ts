// TODO: remove batch from React 18
import { batch } from 'react-redux'
import type { Dispatch } from '../../app/store'
import { AssembleResult, assemble } from './core'
import { AssemblerError } from './core/exceptions'
import { setAssemblerState, setAssemblerError } from './assemblerSlice'
import { setMemoryDataFrom } from '../memory/memorySlice'
import { resetCpu } from '../cpu/cpuSlice'
import { setEditorActiveRange } from '../editor/editorSlice'

type Assemble = (input: string) => void

export const useAssembler =
  (dispatch: Dispatch): Assemble =>
  input => {
    let assembleResult: AssembleResult
    try {
      assembleResult = assemble(input)
    } catch (err) {
      if (err instanceof AssemblerError) {
        const assemblerErrorObject = err.toObject()
        batch(() => {
          dispatch(setEditorActiveRange(undefined))
          dispatch(setAssemblerError(assemblerErrorObject))
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
      dispatch(setEditorActiveRange(addressToStatementMap[0]))
    })
  }
