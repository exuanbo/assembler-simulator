import EditorMessage from './EditorMessage'
import {
  useCodeMirror,
  useAutoAssemble,
  useAssemblerError,
  useBreakpoints,
  useHighlightActiveLine
} from './hooks'

const Editor = (): JSX.Element => {
  const { view, editorRef } = useCodeMirror()

  useAutoAssemble(view)
  useAssemblerError(view)
  useBreakpoints(view)
  useHighlightActiveLine(view)

  return (
    <div className="flex flex-col h-full">
      <div ref={editorRef} className="cursor-auto h-full overflow-y-auto" />
      <EditorMessage />
    </div>
  )
}

export default Editor
