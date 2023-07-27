import { useMemo } from 'react'
import type { CodeMirrorConfig } from '@codemirror-toolkit/react'
import { CodeMirrorProvider } from './codemirror/react'
import CodeMirrorContainer from './CodeMirrorContainer'
import EditorMessage from './EditorMessage'
import { useStore } from '@/app/hooks'
import { selectEditorInput } from './editorSlice'
import { getSetup } from './codemirror/setup'
import { exceptionSink } from './codemirror/exceptionSink'
import { setException } from '@/features/exception/exceptionSlice'

const Editor = (): JSX.Element => {
  const store = useStore()

  const codeMirrorConfig = useMemo<CodeMirrorConfig>(() => {
    const editorInput = selectEditorInput(store.getState())
    return {
      doc: editorInput,
      extensions: [
        getSetup(),
        exceptionSink(exception => {
          store.dispatch(setException(exception))
        })
      ]
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
