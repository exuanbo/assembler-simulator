import { classNames } from '@/common/utils'

import { useContainerRef } from './codemirror/react'
import {
  useAssemblerError,
  useAutoAssemble,
  useAutoFocus,
  useBreakpoints,
  useHighlightLine,
  useSyncInput,
  useVimKeybindings,
} from './hooks'

interface Props {
  className?: string
}

const CodeMirrorContainer = ({ className }: Props): JSX.Element => {
  const containerRef = useContainerRef()

  useVimKeybindings()
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
