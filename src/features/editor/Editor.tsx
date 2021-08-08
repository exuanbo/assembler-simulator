import React, { useState, useRef } from 'react'
import EditorStatus from './EditorStatus'
import { useAppSelector } from '../../app/hooks'
import { selectCode } from './editorSlice'
import { useAssembler } from '../assembler/hooks'

interface Props {
  className?: string
}

const Editor = ({ className }: Props): JSX.Element => {
  const [code, setCode] = useState(useAppSelector(selectCode))

  const textArea = useRef<HTMLTextAreaElement>(null)

  useAssembler(code)

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
      <EditorStatus />
    </div>
  )
}

export default Editor
