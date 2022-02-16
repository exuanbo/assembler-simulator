import { useEffect } from 'react'
import Modal from '@/common/components/Modal'
import { selectUnexpectedError, resetUnexpectedError } from './unexpectedErrorSlice'
import { dispatch } from '@/app/store'
import { useSelector } from '@/app/hooks'
import { useOutsideClick } from '@/common/hooks'

const UnexpectedErrorModal = (): JSX.Element => {
  const unexpectedError = useSelector(selectUnexpectedError)
  const hasUnexpectedError = unexpectedError !== null

  const [isClicked, clickRef] = useOutsideClick()

  useEffect(() => {
    if (isClicked) {
      dispatch(resetUnexpectedError())
    }
  }, [isClicked])

  return (
    <Modal
      className="bg-white flex bg-opacity-80 inset-0 z-50 fixed items-center justify-center"
      isOpen={hasUnexpectedError}>
      <div
        ref={clickRef}
        className="border rounded space-y-2 bg-light-100 shadow py-2 px-4 select-text all:select-text">
        {hasUnexpectedError
          ? unexpectedError.stack
              ?.split(/\n(.*)/s)
              .filter(line => line.length > 0)
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
                          const isErrorType = messagePartIndex === 0
                          return (
                            <div
                              key={messagePartIndex}
                              className={
                                isErrorType
                                  ? 'font-medium text-xl text-red-500'
                                  : 'border-b text-lg py-1'
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
          <span>Please report this bug at </span>
          <a
            className="text-blue-500 underline"
            href="https://github.com/exuanbo/assembler-simulator/issues"
            rel="noopener noreferrer"
            target="_blank">
            https://github.com/exuanbo/assembler-simulator/issues
          </a>
          .
        </div>
      </div>
    </Modal>
  )
}

export default UnexpectedErrorModal
