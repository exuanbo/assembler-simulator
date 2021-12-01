import { useDispatch } from '../../app/hooks'
import { AssembleResult, assemble } from './core'
import { AssemblerError } from './core/exceptions'
import { setAssemblerState } from './assemblerSlice'
import { setMemoryDataFrom } from '../memory/memorySlice'
import { resetCpu } from '../cpu/cpuSlice'
import { setEditorActiveRange } from '../editor/editorSlice'

type Assemble = (input: string) => void

export const useAssembler = (): Assemble => {
  const dispatch = useDispatch()

  return (input: string) => {
    let assembleResult: AssembleResult
    try {
      assembleResult = assemble(input)
    } catch (err) {
      if (err instanceof AssemblerError) {
        dispatch(
          setAssemblerState({
            addressToStatementMap: {},
            error: { ...err }
          })
        )
        dispatch(setEditorActiveRange(undefined))
        return
      }
      // TODO: handle unexpected assemble errors
      throw err
    }
    const [addressToOpcodeMap, addressToStatementMap] = assembleResult
    dispatch(setMemoryDataFrom(addressToOpcodeMap))
    dispatch(resetCpu())
    dispatch(
      setAssemblerState({
        addressToStatementMap,
        error: null
      })
    )
    dispatch(setEditorActiveRange(addressToStatementMap[0]))
  }
}
