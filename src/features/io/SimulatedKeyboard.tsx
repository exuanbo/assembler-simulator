import { useRef } from 'react'
import Modal from '@/common/components/Modal'
import { useStore, useSelector } from '@/app/hooks'
import { selectIsSuspended, setSuspended } from '@/features/controller/controllerSlice'
import {
  selectIsWaitingForKeyboardInput,
  setWaitingForKeyboardInput,
  setInputData
} from './ioSlice'
import { InputPort } from './core'
import { Ascii } from '@/common/constants'

const SimulatedKeyboard = (): JSX.Element | null => {
  const store = useStore()
  const isSuspended = useSelector(selectIsSuspended)
  const isWaitingForKeyboardInput = useSelector(selectIsWaitingForKeyboardInput)

  const inputRef = useRef<HTMLInputElement>(null)

  const focusInput: React.FocusEventHandler<HTMLInputElement> = () => {
    inputRef.current?.focus()
  }

  const dispatchInputData = (content: number): void => {
    store.dispatch(
      setInputData({
        content,
        port: InputPort.SimulatedKeyboard
      })
    )
    store.dispatch(setSuspended(false))
    store.dispatch(setWaitingForKeyboardInput(false))
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = event => {
    switch (event.key) {
      case 'Backspace':
        dispatchInputData(Ascii.BS)
        break
      case 'Tab':
        event.preventDefault()
        dispatchInputData(Ascii.TAB)
        break
      case 'Enter':
        dispatchInputData(Ascii.CR)
        break
    }
  }

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    const key = target.value
    dispatchInputData(key.charCodeAt(0))
  }

  return (
    <Modal
      className="bg-black flex bg-opacity-80 inset-0 fixed items-center justify-center"
      isOpen={isSuspended && isWaitingForKeyboardInput}>
      <div className="border rounded bg-light-100 py-2 px-4">Waiting for keyboard input</div>
      <input
        ref={inputRef}
        autoFocus
        className="-z-1 absolute"
        onBlur={focusInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
    </Modal>
  )
}

export default SimulatedKeyboard
