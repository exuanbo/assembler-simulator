import { useAppDispatch } from '../../app/hooks'
import { setEditorInput } from '../editor/editorSlice'
import { assemble } from './core'
import { setMemoryDataFrom } from '../memory/memorySlice'
import { resetCpu } from '../cpu/cpuSlice'
import { setAssemblerState } from './assemblerSlice'
import { AssemblerError } from '../../common/exceptions'

type Assemble = (input: string) => void

export const useAssembler = (): Assemble => {
  const dispatch = useAppDispatch()

  return (input: string) => {
    dispatch(setEditorInput(input))
    try {
      const [addressToOpcodeMap, addressToStatementMap] = assemble(input)
      dispatch(setMemoryDataFrom(addressToOpcodeMap))
      dispatch(resetCpu())
      dispatch(setAssemblerState({ addressToStatementMap, error: null }))
    } catch (err) {
      if (err instanceof AssemblerError) {
        dispatch(setAssemblerState({ addressToStatementMap: {}, error: { ...err } }))
      } else {
        throw err
      }
    }
  }
}
