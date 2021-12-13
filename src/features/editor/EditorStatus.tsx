import React, { useState, useEffect } from 'react'
import { useSelector } from '../../app/hooks'
import { addActionListener } from '../../app/actionListener'
import { selectAssemblerErrorMessage } from '../assembler/assemblerSlice'
import { setCpuHalted, selectCpuFaultMessage } from '../cpu/cpuSlice'

const EditorStatus = (): JSX.Element | null => {
  const assemblerErrorMessage = useSelector(selectAssemblerErrorMessage)
  const cpuFaultMessage = useSelector(selectCpuFaultMessage)

  const [shouldShowHalted, setShouldShowHalted] = useState(false)

  useEffect(
    () =>
      addActionListener(setCpuHalted, isHalted => {
        setShouldShowHalted(isHalted)
        if (isHalted) {
          setTimeout(() => {
            setShouldShowHalted(false)
          }, 2000)
        }
      }),
    []
  )

  const message =
    assemblerErrorMessage === undefined
      ? cpuFaultMessage === null
        ? shouldShowHalted
          ? 'Info: CPU is halted'
          : null
        : `RuntimeError: ${cpuFaultMessage}`
      : `AssemblerError: ${assemblerErrorMessage}`

  return message === null ? null : (
    <div className={`${shouldShowHalted ? 'bg-blue-500' : 'bg-red-500'} py-1 px-3 text-light-100`}>
      {message}
    </div>
  )
}

export default EditorStatus
