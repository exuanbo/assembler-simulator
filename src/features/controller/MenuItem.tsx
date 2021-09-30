import React, { ReactNode, useState } from 'react'
import { useHover } from '../../common/hooks'

interface Props {
  children: ReactNode
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

const MenuItem = ({ children, onClick }: Props): JSX.Element => (
  <div className="flex space-x-2 py-1 pr-8 pl-2 items-center hover:bg-gray-200" onClick={onClick}>
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
    <div
      ref={hoverRef}
      className="flex py-1 px-2 items-center justify-between hover:bg-gray-200"
      onClick={handleClick}>
      {children(isHovered, menuItemsRef)}
    </div>
  )
}

export default MenuItem
