import { useEffect } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { setEditorInput } from '../editor/editorSlice'
import { assemble } from './core'
import { setAssemblerState } from './assemblerSlice'
import { setMemoryDataFrom } from '../memory/memorySlice'
import { AssemblerError } from '../../common/exceptions'

export const useAssembler = (input: string): void => {
  const dispatch = useAppDispatch()

  const handleInputChange = (): void => {
    dispatch(setEditorInput(input))
    try {
      const [addressToOpcodeMap, addressToStatementMap] = assemble(input)
      dispatch(setMemoryDataFrom(addressToOpcodeMap))
      dispatch(setAssemblerState({ addressToStatementMap, error: null }))
    } catch (err) {
      if (err instanceof AssemblerError) {
        dispatch(setAssemblerState({ addressToStatementMap: {}, error: { ...err } }))
      } else {
        throw err
      }
    }
  }

  useEffect(() => {
    const timeoutID = setTimeout(handleInputChange, 200)
    return () => {
      clearTimeout(timeoutID)
    }
  }, [input])
}
