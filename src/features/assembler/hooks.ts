import { useAppDispatch } from '../../app/hooks'
import { assemble } from './core'
import { setAssemblerState } from './assemblerSlice'
import { setMemoryDataFrom } from '../memory/memorySlice'
import { resetCpu } from '../cpu/cpuSlice'
import { AssemblerError } from '../../common/exceptions'

type Assemble = (input: string) => void

export const useAssembler = (): Assemble => {
  const dispatch = useAppDispatch()

  return (input: string) => {
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
