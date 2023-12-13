import { classNames } from '@/common/utils'

import { useContainerRef, useViewEffect } from './hooks'
import { viewEffects } from './viewEffects'

interface Props {
  className?: string
}

const CodeMirror = ({ className }: Props): JSX.Element => {
  const containerRef = useContainerRef()

  useViewEffect((view) => {
    const destructors = viewEffects.map((effect) => effect(view))
    return () => destructors.forEach((dtor) => dtor?.())
  }, [])

  return (
    <div
      ref={containerRef}
      className={classNames('cursor-auto select-auto overflow-y-auto', className)}
    />
  )
}

export default CodeMirror
