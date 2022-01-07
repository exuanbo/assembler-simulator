import { useState, useEffect } from 'react'
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
    const removeSetCpuHaltedListener = addActionListener(setCpuHalted, isHalted => {
      setShouldShowHalted(isHalted)
      if (isHalted) {
        window.clearTimeout(showHaltedTimeoutId)
        showHaltedTimeoutId = window.setTimeout(() => {
          setShouldShowHalted(false)
        }, 2000)
      }
    })
    const removeResetCpuListener = addActionListener(resetCpu, () => {
      setShouldShowHalted(false)
    })
    return () => {
      removeSetCpuHaltedListener()
      removeResetCpuListener()
    }
  }, [])

  const message =
    assemblerError !== null
      ? `${assemblerError.type}: ${assemblerError.message}`
      : cpuFault !== null
      ? `RuntimeError: ${cpuFault}`
      : shouldShowHalted
      ? 'Info: Program has halted.'
      : null

  return message === null ? null : (
    <div className={`${shouldShowHalted ? 'bg-blue-500' : 'bg-red-500'} py-1 px-2 text-light-100`}>
      {message}
    </div>
  )
}

export default EditorStatus
