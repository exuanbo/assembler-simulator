import React from 'react'
import { useSelector } from '../../app/hooks'
import { selectAssemblerErrorMessage } from '../assembler/assemblerSlice'

const EditorStatus = (): JSX.Element | null => {
  const message = useSelector(selectAssemblerErrorMessage)

  return message === undefined ? null : (
    <div className="bg-red-500 py-1 px-3 text-light-100">{message}</div>
  )
}

export default EditorStatus
