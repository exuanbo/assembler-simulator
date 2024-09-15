import type { FC } from 'react'

import { classNames } from '@/common/utils'

import { effects } from './effects'
import { setContainer, useViewEffect } from './hooks'

interface Props {
  className?: string
}

const CodeMirror: FC<Props> = ({ className }) => {
  useViewEffect(effects)
  return (
    <div
      ref={setContainer}
      className={classNames('cursor-auto select-auto overflow-y-auto', className)}
    />
  )
}

export default CodeMirror
