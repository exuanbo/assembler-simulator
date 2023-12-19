import type { FC, PropsWithChildren } from 'react'

import { classNames } from '../utils/classNames'

type Props = PropsWithChildren<{
  title: string
  onClick?: React.MouseEventHandler<HTMLElement>
}>

const CardHeader: FC<Props> = ({ title, onClick, children }) => {
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
