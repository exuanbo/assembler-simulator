import EditorStatus from './EditorStatus'
import { useCodeMirror, useBreakpoints, useHighlightActiveLine, useAssemblerError } from './hooks'

const Editor = (): JSX.Element => {
  const { view, editorRef } = useCodeMirror()

  useBreakpoints(view)
  useHighlightActiveLine(view)
  useAssemblerError(view)

  return (
    <div className="flex flex-col h-full">
      <div ref={editorRef} className="cursor-auto h-full overflow-y-auto" />
      <EditorStatus />
    </div>
  )
}

export default Editor
