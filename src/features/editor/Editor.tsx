import EditorStatus from './EditorStatus'
import {
  useCodeMirror,
  useBreakpoints,
  useHighlightActiveLine,
  useUnderlineAssemblerError
} from './hooks'

const Editor = (): JSX.Element => {
  const { view, editorRef } = useCodeMirror()

  useBreakpoints(view)
  useHighlightActiveLine(view)
  useUnderlineAssemblerError(view)

  return (
    <div className="flex flex-col h-full">
      <div ref={editorRef} className="h-full overflow-y-auto" />
      <EditorStatus />
    </div>
  )
}

export default Editor
