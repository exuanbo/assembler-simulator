import type { CodeMirrorConfig } from '@codemirror-toolkit/react'
import { useMemo } from 'react'

import { applySelector } from '@/app/selector'
import { store } from '@/app/store'
import { setException } from '@/features/exception/exceptionSlice'

import { exceptionSink } from './codemirror/exceptionSink'
import { CodeMirrorProvider } from './codemirror/react'
import { getSetup } from './codemirror/setup'
import CodeMirrorContainer from './CodeMirrorContainer'
import EditorMessage from './EditorMessage'
import { selectEditorInput } from './editorSlice'

const Editor = (): JSX.Element => {
  const codeMirrorConfig = useMemo<CodeMirrorConfig>(() => {
    const editorInput = applySelector(selectEditorInput)
    return {
      doc: editorInput,
      extensions: [
        getSetup(),
        exceptionSink((exception) => {
          store.dispatch(setException(exception))
        }),
      ],
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <CodeMirrorProvider config={codeMirrorConfig}>
        <CodeMirrorContainer className="flex-1" />
      </CodeMirrorProvider>
      <EditorMessage />
    </div>
  )
}

export default Editor
