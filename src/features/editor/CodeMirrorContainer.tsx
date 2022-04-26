import { useCodeMirrorRef } from './codemirror/hooks'
import {
  useSyncInput,
  useAutoFocus,
  useAutoAssemble,
  useAssemblerError,
  useHighlightActiveLine,
  useBreakpoints
} from './hooks'
import { classNames } from '@/common/utils'

interface Props {
  className?: string
}

const CodeMirrorContainer = ({ className }: Props): JSX.Element => {
  const ref = useCodeMirrorRef()

  useSyncInput()
  useAutoFocus()
  useAutoAssemble()
  useAssemblerError()
  useHighlightActiveLine()
  useBreakpoints()

  return <div ref={ref} className={classNames('cursor-auto overflow-y-auto', className)} />
}

export default CodeMirrorContainer
