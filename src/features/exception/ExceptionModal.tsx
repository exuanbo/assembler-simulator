import { useCallback } from 'react'

import { useSelector } from '@/app/selector'
import { store } from '@/app/store'
import Anchor from '@/common/components/Anchor'
import Modal from '@/common/components/Modal'
import { useOutsideClick } from '@/common/hooks'

import { clearException, selectException } from './exceptionSlice'

const ExceptionModal = (): JSX.Element => {
  const error = useSelector(selectException)
  const hasError = error !== null

  const handleOutsideClick = useCallback(() => {
    store.dispatch(clearException())
  }, [])
  const outsideClickRef = useOutsideClick(handleOutsideClick)

  return (
    <Modal
      className="bg-white flex bg-opacity-80 inset-0 z-50 fixed items-center justify-center"
      isOpen={hasError}>
      <div
        ref={outsideClickRef}
        className="border rounded space-y-2 bg-light-100 shadow py-2 px-4 select-text all:select-text">
        {hasError
          ? error.stack
              ?.split(/\n(.*)/s)
              .slice(0, -1) // remove empty string
              .map((line, lineIndex) => {
                const isErrorMessage = lineIndex === 0
                return isErrorMessage ? (
                  <div key={lineIndex}>
                    {line.split(': ').map((messagePart, messagePartIndex) => {
                      const isErrorName = messagePartIndex === 0
                      return (
                        <div
                          key={messagePartIndex}
                          className={
                            isErrorName ? 'text-xl text-red-500' : 'border-b text-lg py-1'
                          }>
                          {messagePart}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div
                    key={lineIndex}
                    className="rounded bg-red-50 py-2 px-5.5 text-gray-600 whitespace-pre-line">
                    {line}
                  </div>
                )
              })
          : null}
        <div>
          Please report this bug at{' '}
          <Anchor href="https://github.com/exuanbo/assembler-simulator/issues">
            https://github.com/exuanbo/assembler-simulator/issues
          </Anchor>
          .
        </div>
      </div>
    </Modal>
  )
}

export default ExceptionModal
