import EditorMessage from './EditorMessage'
import { useCodeMirror } from './hooks'

const Editor = (): JSX.Element => {
  const editorRef = useCodeMirror()

  return (
    <div className="flex flex-col h-full">
      <div ref={editorRef} className="cursor-auto h-full overflow-y-auto" />
      <EditorMessage />
    </div>
  )
}

export default Editor
