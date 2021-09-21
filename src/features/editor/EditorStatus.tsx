import React from 'react'
import { useSelector } from '../../app/hooks'
import { selectAssemblerError } from '../assembler/assemblerSlice'

const EditorStatus = (): JSX.Element | null => {
  const error = useSelector(selectAssemblerError)

  return error === null ? null : (
    <div className="bg-red-500 py-1 px-3 text-light-100">{error.message}</div>
  )
}

export default EditorStatus
