import { useCodeMirrorRef } from './codemirror/hooks'
import {
  useSyncInput,
  useAutoAssemble,
  useAssemblerError,
  useHighlightActiveLine,
  useBreakpoints
} from './hooks'

interface Props {
  className?: string
}

const CodeMirrorContainer = ({ className = '' }: Props): JSX.Element => {
  const ref = useCodeMirrorRef()

  useSyncInput()
  useAutoAssemble()
  useAssemblerError()
  useHighlightActiveLine()
  useBreakpoints()

  return <div ref={ref} className={`cursor-auto overflow-y-auto ${className}`} />
}

export default CodeMirrorContainer
