import { useCallback } from 'react'
import Modal from '@/common/components/Modal'
import Anchor from '@/common/components/Anchor'
import { selectUnexpectedError, clearUnexpectedError } from './unexpectedErrorSlice'
import { useStore, useSelector } from '@/app/hooks'
import { useOutsideClick } from '@/common/hooks'

const UnexpectedErrorModal = (): JSX.Element => {
  const store = useStore()
  const unexpectedError = useSelector(selectUnexpectedError)
  const hasUnexpectedError = unexpectedError !== null

  const handleOutsideClick = useCallback(() => {
    store.dispatch(clearUnexpectedError())
  }, [])

  const outsideClickRef = useOutsideClick(handleOutsideClick)

  return (
    <Modal
      className="bg-white flex bg-opacity-80 inset-0 z-50 fixed items-center justify-center"
      isOpen={hasUnexpectedError}>
      <div
        ref={outsideClickRef}
        className="border rounded space-y-2 bg-light-100 shadow py-2 px-4 select-text all:select-text">
        {hasUnexpectedError
          ? unexpectedError.stack
              ?.split(/\n(.*)/s)
              .slice(0, -1)
              .map((line, lineIndex) => {
                const isErrorMessage = lineIndex === 0
                return (
                  <div
                    key={lineIndex}
                    className={
                      isErrorMessage
                        ? undefined
                        : 'rounded bg-red-50 py-2 px-5.5 text-gray-600 whitespace-pre-line'
                    }>
                    {isErrorMessage
                      ? line.split(': ').map((messagePart, messagePartIndex) => {
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
                        })
                      : line}
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

export default UnexpectedErrorModal
