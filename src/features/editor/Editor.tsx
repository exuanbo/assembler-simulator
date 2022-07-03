import { useMemo } from 'react'
import CodeMirrorContext from './codemirror/Context'
import CodeMirrorContainer from './CodeMirrorContainer'
import EditorMessage from './EditorMessage'
import { useStore } from '@/app/hooks'
import { selectEditorInput } from './editorSlice'
import { useCodeMirror } from './codemirror/hooks'
import { setup } from './codemirror/setup'

const Editor = (): JSX.Element => {
  const store = useStore()

  const codeMirrorConfig = useMemo(() => {
    const defaultInput = selectEditorInput(store.getState())
    return {
      doc: defaultInput,
      extensions: setup
    }
  }, [])

  const codeMirror = useCodeMirror(codeMirrorConfig)

  return (
    <div className="flex flex-col h-full">
      <CodeMirrorContext.Provider value={codeMirror}>
        <CodeMirrorContainer className="flex-1" />
      </CodeMirrorContext.Provider>
      <EditorMessage />
    </div>
  )
}

export default Editor
