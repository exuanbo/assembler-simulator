import { type FC, useEffect, useRef, useState } from 'react'

import { store, useSelector } from '@/app/store'
import Modal from '@/common/components/Modal'
import { Ascii } from '@/common/constants'
import { classNames, range } from '@/common/utils'
import { selectIsSuspended, setSuspended } from '@/features/controller/controllerSlice'

import { InputPort, SKIP } from './core'
import {
  selectIsWaitingForKeyboardInput,
  setInputData,
  setWaitingForKeyboardInput,
} from './ioSlice'

const MAX_DOT_COUNT = 3
const PULSE_INTERVAL_MS = 250

const PulseLoader: FC = () => {
  const [count, setCount] = useState(1)

  useEffect(() => {
    const intervalId = window.setInterval(
      () => setCount((prevCount) => (prevCount + 1) % (MAX_DOT_COUNT + 1)),
      PULSE_INTERVAL_MS,
    )
    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <span className="inline-block my-auto">
      {range(MAX_DOT_COUNT).map((index) => (
        <span key={index} className={classNames({ invisible: index >= count })}>
          .
        </span>
      ))}
    </span>
  )
}

const SimulatedKeyboard: FC = () => {
  const isSuspended = useSelector(selectIsSuspended)
  const isWaitingForKeyboardInput = useSelector(selectIsWaitingForKeyboardInput)
  const shouldOpen = isSuspended && isWaitingForKeyboardInput

  const inputRef = useRef<HTMLInputElement>(null)

  const focusInput = (): void => {
    // focus immediately `onBlur` does not work in Firefox
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
    // handle special keys
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
      className="bg-black bg-opacity-20 animate-fade-in animate-duration-250"
      isOpen={shouldOpen}>
      <div className="rounded bg-light-100 shadow py-4 px-8">
        Waiting for keyboard input <PulseLoader />
      </div>
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
