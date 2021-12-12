import React, { useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSelector, useDispatch } from '../../app/hooks'
import { selectIsSuspended, setSuspended } from '../controller/controllerSlice'
import { setCpuInput } from '../cpu/cpuSlice'
import { InputPort } from '../cpu/core'

const SimulatedKeyboard = (): JSX.Element | null => {
  const inputRef = useRef<HTMLInputElement>(null)
  const isSuspended = useSelector(selectIsSuspended)
  const dispatch = useDispatch()

  const focusInput: React.FocusEventHandler<HTMLInputElement> = () => {
    inputRef.current!.focus()
  }

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
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
        <div className="bg-black flex font-mono h-screen bg-opacity-80 w-screen z-1 absolute items-center justify-center">
          <div className="rounded bg-light-50 py-2 px-4">Waiting for keyboard input</div>
          <input
            ref={inputRef}
            autoFocus
            className="-z-1 absolute"
            onBlur={focusInput}
            onChange={handleInputChange}
          />
        </div>,
        document.getElementById('modal-root')!
      )
    : null
}

export default SimulatedKeyboard
