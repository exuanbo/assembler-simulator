import React, { ReactNode, useState } from 'react'
import { useHover } from '../../common/hooks'

interface Props {
  children: ReactNode | ((isHovered: boolean) => ReactNode)
  className?: string
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

const MenuItem = ({ children, className = '', onClick }: Props): JSX.Element => {
  const willHandleHover = typeof children === 'function'
  const [isHovered, hoverRef] = useHover<HTMLDivElement>()

  return (
    <div
      ref={willHandleHover ? hoverRef : undefined}
      className={`flex py-1 px-2 items-center hover:bg-gray-200 ${className}`}
      onClick={onClick}>
      {willHandleHover ? children(isHovered) : children}
    </div>
  )
}

interface SubMenuProps {
  children: (isHovered: boolean, menuItemsRef: React.RefCallback<HTMLDivElement>) => ReactNode
}

MenuItem.SubMenu = ({ children }: SubMenuProps): JSX.Element => {
  const [menuItems, setMenuItems] = useState<HTMLDivElement | null>(null)

  const handleClick = (event: React.MouseEvent): void => {
    if (menuItems === null) {
      return
    }
    const { target } = event
    if (target instanceof Element && !menuItems.contains(target)) {
      event.stopPropagation()
    }
  }

  const menuItemsRef = (node: HTMLDivElement | null): void => {
    setMenuItems(node)
  }

  return (
    <MenuItem className="justify-between" onClick={handleClick}>
      {isHovered => children(isHovered, menuItemsRef)}
    </MenuItem>
  )
}

export default MenuItem
