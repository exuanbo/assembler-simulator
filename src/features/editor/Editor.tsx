import EditorStatus from './EditorStatus'
import {
  useCodeMirror,
  useAutoAssemble,
  useAssemblerError,
  useBreakpoints,
  useHighlightActiveLine
} from './hooks'

const Editor = (): JSX.Element => {
  const { view, editorRef } = useCodeMirror()

  useAutoAssemble()
  useAssemblerError(view)
  useBreakpoints(view)
  useHighlightActiveLine(view)

  return (
    <div className="flex flex-col h-full">
      <div ref={editorRef} className="cursor-auto h-full overflow-y-auto" />
      <EditorStatus />
    </div>
  )
}

export default Editor
