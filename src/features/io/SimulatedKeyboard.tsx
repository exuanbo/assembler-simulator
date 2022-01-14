import { useRef } from 'react'
import { createPortal } from 'react-dom'
// TODO: remove batch from React 18
import { batch } from 'react-redux'
import { dispatch } from '@/app/store'
import { useSelector } from '@/app/hooks'
import { selectIsSuspended, setSuspended } from '@/features/controller/controllerSlice'
import {
  selectIsWaitingForKeyboardInput,
  setWaitingForKeyboardInput,
  setInputData
} from './ioSlice'
import { InputPort } from './core'

const SimulatedKeyboard = (): JSX.Element | null => {
  const inputRef = useRef<HTMLInputElement>(null)
  const isSuspended = useSelector(selectIsSuspended)
  const isWaitingForKeyboardInput = useSelector(selectIsWaitingForKeyboardInput)

  const focusInput: React.FocusEventHandler<HTMLInputElement> = () => {
    inputRef.current!.focus()
  }

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    const key = target.value
    dispatch(
      setInputData({
        content: key.charCodeAt(0),
        port: InputPort.SimulatedKeyboard
      })
    )
    batch(() => {
      dispatch(setSuspended(false))
      dispatch(setWaitingForKeyboardInput(false))
    })
  }

  return isSuspended && isWaitingForKeyboardInput
    ? createPortal(
        <div className="bg-black flex font-mono bg-opacity-80 inset-0 z-1 fixed items-center justify-center">
          <div className="rounded bg-light-100 py-2 px-4">Waiting for keyboard input</div>
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
