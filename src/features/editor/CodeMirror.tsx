import type { FC } from 'react'

import { classNames } from '@/common/utils'

import { viewEffects } from './effects'
import { useContainerRef, useViewEffect } from './hooks'

interface Props {
  className?: string
}

const CodeMirror: FC<Props> = ({ className }) => {
  const containerRef = useContainerRef()

  useViewEffect((view) => {
    const cleanups = viewEffects.map((effect) => effect(view))
    return () => cleanups.forEach((cleanup) => cleanup?.())
  })

  return (
    <div
      ref={containerRef}
      className={classNames('cursor-auto select-auto overflow-y-auto', className)}
    />
  )
}

export default CodeMirror
