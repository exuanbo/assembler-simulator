import React, { useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSelector, useDispatch } from '../../app/hooks'
import { selectIsSuspended, setSuspended } from '../controller/controllerSlice'
import { setCpuInput } from '../cpu/cpuSlice'
import { InputPort } from '../cpu/core'

const SimulatedKeyboard = (): JSX.Element | null => {
  const isSuspended = useSelector(selectIsSuspended)
  const inputRef = useRef<HTMLInputElement>(null)
  const dispatch = useDispatch()

  const focusInput = (): void => {
    inputRef.current!.focus()
  }

  const handleInputChang = ({ target }: React.ChangeEvent<HTMLInputElement>): void => {
    const key = target.value
    dispatch(
      setCpuInput({
        data: key.charCodeAt(0),
        inputPort: InputPort.SimulatedKeyboard
      })
    )
    dispatch(setSuspended(false))
  }

  return isSuspended
    ? createPortal(
        <div className="bg-black flex font-mono h-screen bg-opacity-80 w-screen top-0 left-0 z-1 fixed items-center justify-center select-none">
          <div className="rounded bg-light-50 py-2 px-4">Waiting for keyboard input</div>
          <input
            ref={inputRef}
            autoFocus
            className="-z-1 absolute"
            onBlur={focusInput}
            onChange={handleInputChang}
          />
        </div>,
        document.getElementById('modal-root')!
      )
    : null
}

export default SimulatedKeyboard
