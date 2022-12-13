import { useMemo } from 'react'
import { CodeMirrorProvider } from './codemirror/Context'
import CodeMirrorContainer from './CodeMirrorContainer'
import EditorMessage from './EditorMessage'
import { useStore } from '@/app/hooks'
import { selectEditorInput } from './editorSlice'
import { CodeMirrorConfig, useCodeMirror } from './codemirror/hooks'
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
  const codeMirror = useCodeMirror(codeMirrorConfig)

  return (
    <div className="flex flex-col h-full">
      <CodeMirrorProvider value={codeMirror}>
        <CodeMirrorContainer className="flex-1" />
      </CodeMirrorProvider>
      <EditorMessage />
    </div>
  )
}

export default Editor
