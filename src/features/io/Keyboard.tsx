import React, { useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { selectIsSuspended, setSuspended } from '../controller/controllerSlice'
import { setCpuInput } from '../cpu/cpuSlice'

// TODO: add spinner
const Keyboard = (): JSX.Element | null => {
  const isSuspended = useAppSelector(selectIsSuspended)
  const inputRef = useRef<HTMLInputElement>(null)
  const dispatch = useAppDispatch()

  const focusInput = (): void => {
    inputRef.current?.focus()
  }

  return isSuspended
    ? createPortal(
        <div className="bg-black flex font-mono h-screen bg-opacity-80 w-screen top-0 left-0 fixed items-center justify-center select-none">
          <div className="rounded bg-light-50 shadow py-2 px-4">Waiting for keyboard input</div>
          <input
            ref={inputRef}
            autoFocus
            className="-z-1 absolute"
            onBlur={focusInput}
            onChange={({ target }) => {
              const key = target.value
              dispatch(
                setCpuInput({
                  data: key.charCodeAt(0),
                  inputPort: 0
                })
              )
              dispatch(setSuspended(false))
            }}
          />
        </div>,
        document.getElementById('modal-root')!
      )
    : null
}

export default Keyboard
