import React, { useState } from 'react'
import { useCodeMirror } from './codemirror/hooks'
import { setup } from './codemirror/setup'
import EditorStatus from './EditorStatus'
import { useAppSelector } from '../../app/hooks'
import { selectEditortInput } from './editorSlice'
import { useAssembler } from '../assembler/hooks'
// import { breakpointEffect } from './codemirror/breakpointGutter'

interface Props {
  className?: string
}

const Editor = ({ className }: Props): JSX.Element => {
  const [input, setInput] = useState(useAppSelector(selectEditortInput))

  useAssembler(input)

  const { editorRef } = useCodeMirror<HTMLDivElement>(
    {
      doc: input,
      extensions: setup
    },
    viewUpdate => {
      if (viewUpdate.docChanged) {
        const { doc } = viewUpdate.state
        setInput(doc.sliceString(0))
      }
      // TODO: handle breakpoint
      // viewUpdate.transactions.forEach(transaction => {
      //   transaction.effects.forEach(effect => {
      //     if (effect.is(breakpointEffect)) {
      //       const actionCreator = effect.value.on ? addBreakpoint : removeBreakpoint
      //       const lineNumber = viewUpdate.state.doc.lineAt(effect.value.pos).number
      //       dispatch(actionCreator(lineNumber))
      //     }
      //   })
      // })
    }
  )

  return (
    <div ref={editorRef} className={`flex flex-col ${className}`}>
      <EditorStatus />
    </div>
  )
}

export default Editor
