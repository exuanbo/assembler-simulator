import type { CodeMirrorConfigCreator } from '@codemirror-toolkit/react'

import { applySelector, store } from '@/app/store'
import { setException } from '@/features/exception/exceptionSlice'

import { exceptionSink } from './codemirror/exceptionSink'
import { CodeMirrorProvider } from './codemirror/react'
import { setup } from './codemirror/setup'
import CodeMirrorContainer from './CodeMirrorContainer'
import EditorMessage from './EditorMessage'
import { selectEditorInput } from './editorSlice'

const config: CodeMirrorConfigCreator = () => {
  const editorInput = applySelector(selectEditorInput)
  return {
    doc: editorInput,
    extensions: [
      setup(),
      exceptionSink((exception) => {
        store.dispatch(setException(exception))
      }),
    ],
  }
}

const Editor = (): JSX.Element => (
  <div className="flex flex-col h-full">
    <CodeMirrorProvider config={config}>
      <CodeMirrorContainer className="flex-1" />
    </CodeMirrorProvider>
    <EditorMessage />
  </div>
)

export default Editor
