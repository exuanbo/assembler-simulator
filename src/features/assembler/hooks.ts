import { useAppDispatch } from '../../app/hooks'
import { assemble, AssemblerError } from './core'
import { setAssemblerState } from './assemblerSlice'
import { setMemoryDataFrom } from '../memory/memorySlice'
import { resetCpu } from '../cpu/cpuSlice'
import { setEditorActiveRange } from '../editor/editorSlice'

type Assemble = (input: string) => void

export const useAssembler = (): Assemble => {
  const dispatch = useAppDispatch()

  return (input: string) => {
    try {
      const [addressToOpcodeMap, addressToStatementMap] = assemble(input)
      dispatch(setMemoryDataFrom(addressToOpcodeMap))
      dispatch(resetCpu())
      dispatch(
        setAssemblerState({
          addressToStatementMap,
          error: null
        })
      )
      dispatch(setEditorActiveRange(addressToStatementMap[0]))
    } catch (err) {
      if (err instanceof AssemblerError) {
        dispatch(
          setAssemblerState({
            addressToStatementMap: {},
            error: { ...err }
          })
        )
      } else {
        throw err
      }
    }
  }
}
