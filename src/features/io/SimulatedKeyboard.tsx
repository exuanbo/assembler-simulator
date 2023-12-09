import { useRef } from 'react'

import { store, useSelector } from '@/app/store'
import Modal from '@/common/components/Modal'
import { Ascii } from '@/common/constants'
import { selectIsSuspended, setSuspended } from '@/features/controller/controllerSlice'

import { InputPort, SKIP } from './core'
import {
  selectIsWaitingForKeyboardInput,
  setInputData,
  setWaitingForKeyboardInput,
} from './ioSlice'

const SimulatedKeyboard = (): JSX.Element | null => {
  const isSuspended = useSelector(selectIsSuspended)
  const isWaitingForKeyboardInput = useSelector(selectIsWaitingForKeyboardInput)
  const shouldOpen = isSuspended && isWaitingForKeyboardInput

  const inputRef = useRef<HTMLInputElement>(null)

  const focusInput = (): void => {
    // focus immediately `onBlur` does not work in Firefox
    // we have to let the element lose focus first
    // https://stackoverflow.com/a/15670691/13346012
    window.setTimeout(() => {
      inputRef.current?.focus()
    })
  }

  const dispatchInputData = (content: number): void => {
    store.dispatch(
      setInputData({
        content,
        port: InputPort.SimulatedKeyboard,
      }),
    )
    store.dispatch(setSuspended(false))
    store.dispatch(setWaitingForKeyboardInput(false))
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
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
      case 'Escape':
        dispatchInputData(SKIP)
        break
    }
  }

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const input = event.target.value
    dispatchInputData(input.charCodeAt(0))
  }

  return (
    <Modal
      className="bg-black flex bg-opacity-80 inset-0 fixed items-center justify-center"
      isOpen={shouldOpen}>
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
