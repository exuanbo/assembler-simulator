import { useMemo } from 'react'
import { CodeMirrorProvider } from './codemirror/Context'
import CodeMirrorContainer from './CodeMirrorContainer'
import EditorMessage from './EditorMessage'
import { useStore } from '@/app/hooks'
import { selectEditorInput } from './editorSlice'
import { CodeMirrorConfig, useCodeMirror } from './codemirror/hooks'
import { getSetup } from './codemirror/setup'

const Editor = (): JSX.Element => {
  const store = useStore()

  const codeMirrorConfig = useMemo<CodeMirrorConfig>(() => {
    const editorInput = selectEditorInput(store.getState())
    return {
      doc: editorInput,
      extensions: getSetup()
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
