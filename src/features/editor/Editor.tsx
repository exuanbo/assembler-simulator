import CodeMirror from './CodeMirror'
import EditorMessage from './EditorMessage'

const Editor = (): JSX.Element => (
  <div className="flex flex-col h-full">
    <CodeMirror className="flex-1" />
    <EditorMessage />
  </div>
)

export default Editor
