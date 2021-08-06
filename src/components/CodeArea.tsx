import React, { useEffect, useRef } from 'react'
import Status from './Status'
import { codeState, memoryState, errorState } from '../atoms'
import { assemble, initMemoryFrom } from '../core'

interface Props {
  className?: string
}

const CodeArea = ({ className }: Props): JSX.Element => {
  const [code, setCode] = codeState.useState()
  const [, setMemory] = memoryState.useState()
  const [, setError] = errorState.useState()

  const textArea = useRef<HTMLTextAreaElement>(null)

  const handleCodeChange = (): void => {
    try {
      const [addressToOpcodeMap] = assemble(code)
      setMemory(initMemoryFrom(addressToOpcodeMap))
      setError(null)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        throw err
      }
    }
  }

  useEffect(() => {
    const timeoutID = setTimeout(handleCodeChange, 200)
    return () => {
      clearTimeout(timeoutID)
    }
  }, [code])

  return (
    <div className={`flex flex-col ${className}`}>
      <textarea
        ref={textArea}
        className="w-full h-full px-3 py-1 font-mono resize-none focus:outline-none"
        spellCheck={false}
        value={code}
        onChange={event => {
          setCode(event.target.value)
        }}
        onKeyDown={event => {
          if (event.key === 'Tab') {
            event.preventDefault()
            const { current } = textArea
            if (current !== null) {
              const { selectionStart, selectionEnd, value } = current
              current.value = value.slice(0, selectionStart) + '\t' + value.slice(selectionEnd)
              current.selectionStart = current.selectionEnd = selectionStart + 1
            }
          }
        }}
      />
      <Status />
    </div>
  )
}

export default CodeArea
