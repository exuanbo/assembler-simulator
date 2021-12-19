import React, { useState, useEffect } from 'react'
import { useSelector } from '../../app/hooks'
import { addActionListener } from '../../app/actionListener'
import { selectAssemblerError } from '../assembler/assemblerSlice'
import { selectCpuFault, setCpuHalted, resetCpu } from '../cpu/cpuSlice'

let showHaltedTimeoutId: number | undefined

const EditorStatus = (): JSX.Element | null => {
  const assemblerError = useSelector(selectAssemblerError)
  const cpuFault = useSelector(selectCpuFault)
  const [shouldShowHalted, setShouldShowHalted] = useState(false)

  useEffect(() => {
    addActionListener(setCpuHalted, isHalted => {
      setShouldShowHalted(isHalted)
      if (isHalted) {
        window.clearTimeout(showHaltedTimeoutId)
        showHaltedTimeoutId = window.setTimeout(() => {
          setShouldShowHalted(false)
        }, 2000)
      }
    })
    addActionListener(resetCpu, () => {
      setShouldShowHalted(false)
    })
  }, [])

  const message =
    assemblerError === null
      ? cpuFault === null
        ? shouldShowHalted
          ? 'Info: CPU is halted'
          : null
        : `RuntimeError: ${cpuFault}`
      : `${assemblerError.type}: ${assemblerError.message}`

  return message === null ? null : (
    <div className={`${shouldShowHalted ? 'bg-blue-500' : 'bg-red-500'} py-1 px-3 text-light-100`}>
      {message}
    </div>
  )
}

export default EditorStatus
