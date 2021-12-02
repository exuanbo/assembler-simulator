import React from 'react'
import { useSelector } from '../../app/hooks'
import { selectAssemblerErrorMessage } from '../assembler/assemblerSlice'
import { selectCpuFaultMessage } from '../cpu/cpuSlice'

const EditorStatus = (): JSX.Element | null => {
  const assemblerErrorMessage = useSelector(selectAssemblerErrorMessage)
  const cpuFaultMessage = useSelector(selectCpuFaultMessage)

  const message =
    assemblerErrorMessage === undefined
      ? cpuFaultMessage === null
        ? null
        : `Runtime Error: ${cpuFaultMessage}`
      : `Assembler Error: ${assemblerErrorMessage}`

  return message === null ? null : (
    <div className="bg-red-500 py-1 px-3 text-light-100">{message}</div>
  )
}

export default EditorStatus
