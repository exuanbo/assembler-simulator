import type { ReactNode } from 'react'

import { classNames } from '../utils/classNames'

interface Props {
  title: string
  onClick?: React.MouseEventHandler<HTMLElement>
  children?: ReactNode
}

const CardHeader = ({ title, onClick, children }: Props): JSX.Element => {
  const isClickable = onClick !== undefined
  return (
    <header
      className={classNames(
        'border-b flex space-x-2 bg-gray-100 py-1 px-2 items-center justify-between',
        { 'cursor-pointer': isClickable },
      )}
      onClick={onClick}>
      <span>{title}</span>
      {children}
    </header>
  )
}

export default CardHeader
