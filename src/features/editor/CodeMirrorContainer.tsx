import { useContainerRef } from './codemirror/hooks'
import {
  useSyncInput,
  useAutoFocus,
  useAutoAssemble,
  useAssemblerError,
  useHighlightLine,
  useBreakpoints
} from './hooks'
import { classNames } from '@/common/utils'

interface Props {
  className?: string
}

const CodeMirrorContainer = ({ className }: Props): JSX.Element => {
  const containerRef = useContainerRef()

  useSyncInput()
  useAutoFocus()
  useAutoAssemble()
  useAssemblerError()
  useHighlightLine()
  useBreakpoints()

  return (
    <div
      ref={containerRef}
      className={classNames('cursor-auto select-auto overflow-y-auto', className)}
    />
  )
}

export default CodeMirrorContainer
