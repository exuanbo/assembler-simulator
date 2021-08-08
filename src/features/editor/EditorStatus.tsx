import React from 'react'
import { useAppSelector } from '../../app/hooks'
import { selectAssemblerError } from '../assembler/assemblerSlice'

const EditorStatus = (): JSX.Element | null => {
  const error = useAppSelector(selectAssemblerError)

  return error !== null ? (
    <div className={`px-3 py-1 text-white ${error === null ? 'bg-blue-500' : 'bg-red-500'}`}>
      {error.message}
    </div>
  ) : null
}

export default EditorStatus
