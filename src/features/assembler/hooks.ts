import { useEffect } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { setCode as setEditorCode } from '../editor/editorSlice'
import { assemble } from '../../core'
import { setState as setAssemblerState } from './assemblerSlice'
import { setData as setMemoryData } from '../memory/memorySlice'
import { AssemblerError } from '../../core/exceptions'

export const useAssembler = (code: string): void => {
  const dispatch = useAppDispatch()

  const handleCodeChange = (): void => {
    dispatch(setEditorCode(code))
    try {
      const [addressToOpcodeMap, addressToStatementMap] = assemble(code)
      dispatch(setAssemblerState({ addressToStatementMap, error: null }))
      dispatch(setMemoryData(addressToOpcodeMap))
    } catch (err) {
      if (err instanceof AssemblerError) {
        dispatch(setAssemblerState({ addressToStatementMap: {}, error: { ...err } }))
      } else {
        throw err
      }
    }
  }

  useEffect(() => {
    const timeoutID = setTimeout(handleCodeChange, 200)
    return () => {
      clearTimeout(timeoutID)
    }
  }, [code])
}
