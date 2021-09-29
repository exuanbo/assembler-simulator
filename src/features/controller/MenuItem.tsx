import React, { ReactNode, useState } from 'react'
import { useHover } from '../../common/hooks'

interface Props {
  children: ReactNode
  innerRef?: React.Ref<HTMLDivElement>
  className?: string
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

const MenuItem = ({ children, innerRef, className = '', onClick }: Props): JSX.Element => (
  <div
    ref={innerRef}
    className={`flex py-1 px-2 items-center hover:bg-gray-200 ${className}`}
    onClick={onClick}>
    {children}
  </div>
)

interface SubMenuProps {
  children: (isHovered: boolean, menuItemsRef: React.RefCallback<HTMLDivElement>) => ReactNode
}

MenuItem.SubMenu = ({ children }: SubMenuProps): JSX.Element => {
  const [isHovered, hoverRef] = useHover<HTMLDivElement>()
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
    <MenuItem className="justify-between" innerRef={hoverRef} onClick={handleClick}>
      {children(isHovered, menuItemsRef)}
    </MenuItem>
  )
}

export default MenuItem
