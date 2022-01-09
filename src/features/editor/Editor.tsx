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
    <div ref={editorRef} className="flex flex-col h-full">
      <EditorStatus />
    </div>
  )
}

export default Editor
