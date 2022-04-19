import { useMemo } from 'react'
import CodeMirrorContext from './CodeMirrorContext'
import CodeMirror from './CodeMirror'
import EditorMessage from './EditorMessage'
import { useStore } from '@/app/hooks'
import { selectEditorInput } from './editorSlice'
import { useCodeMirror } from './codemirror/hooks'
import { setup } from './codemirror/setup'

const Editor = (): JSX.Element => {
  const store = useStore()

  const editorStateConfig = useMemo(() => {
    const defaultInput = selectEditorInput(store.getState())
    return {
      doc: defaultInput,
      extensions: setup
    }
  }, [])

  const [view, ref] = useCodeMirror(editorStateConfig)

  return (
    <div className="flex flex-col h-full">
      <CodeMirrorContext.Provider value={view}>
        <CodeMirror className="flex-1" innerRef={ref} />
      </CodeMirrorContext.Provider>
      <EditorMessage />
    </div>
  )
}

export default Editor
