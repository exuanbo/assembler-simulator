import React, { ReactNode } from 'react'
import { useHover } from './hooks'

interface Props {
  children: (isHovered: boolean) => ReactNode
  className?: string
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

const MenuItem = ({ children, className = '', onClick }: Props): JSX.Element => {
  const [hoverRef, isHovered] = useHover<HTMLDivElement>()

  return (
    <div
      ref={hoverRef}
      className={`flex py-0.5 px-2 items-center hover:bg-gray-200 ${className}`}
      onClick={onClick}>
      {children(isHovered)}
    </div>
  )
}

export default MenuItem
