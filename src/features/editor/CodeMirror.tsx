import type { Ref } from 'react'
import {
  useSyncInput,
  useAutoAssemble,
  useAssemblerError,
  useHighlightActiveLine,
  useBreakpoints
} from './hooks'

interface Props {
  innerRef: Ref<HTMLDivElement>
  className?: string
}

const CodeMirror = ({ innerRef, className = '' }: Props): JSX.Element => {
  useSyncInput()

  useAutoAssemble()
  useAssemblerError()
  useHighlightActiveLine()
  useBreakpoints()

  return <div ref={innerRef} className={`cursor-auto overflow-y-auto ${className}`} />
}

export default CodeMirror
