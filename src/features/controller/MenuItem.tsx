import React, { ReactNode, useRef } from 'react'
import { useHover } from '../../common/hooks'

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
      className={`flex py-1 px-2 items-center hover:bg-gray-200 ${className}`}
      onClick={onClick}>
      {children(isHovered)}
    </div>
  )
}

interface SubMenuProps {
  children: (isHovered: boolean, menuItemsRef: React.RefObject<HTMLDivElement>) => ReactNode
}

MenuItem.SubMenu = ({ children }: SubMenuProps): JSX.Element => {
  const menuItemsRef = useRef<HTMLDivElement>(null)

  const handleClick = (event: React.MouseEvent): void => {
    const { current } = menuItemsRef
    const { target } = event
    if (current !== null && target instanceof Element && !current.contains(target)) {
      event.stopPropagation()
    }
  }

  return (
    <MenuItem className="justify-between" onClick={handleClick}>
      {isHovered => children(isHovered, menuItemsRef)}
    </MenuItem>
  )
}

export default MenuItem
