import EditorStatus from './EditorStatus'
import {
  useCodeMirror,
  useBreakpoints,
  useHighlightActiveLine,
  useUnderlineAssemblerError
} from './hooks'

interface Props {
  className: string
}

const Editor = ({ className }: Props): JSX.Element => {
  const { view, editorRef } = useCodeMirror()

  useBreakpoints(view)
  useHighlightActiveLine(view)
  useUnderlineAssemblerError(view)

  return (
    <div ref={editorRef} className={`flex flex-col ${className}`}>
      <EditorStatus />
    </div>
  )
}

export default Editor
