import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
  innerRef?: React.Ref<HTMLDivElement>
  className?: string
}

const MenuItems = ({ children, innerRef, className = '' }: Props): JSX.Element => (
  <div ref={innerRef} className={`divide-y border bg-gray-50 shadow fixed ${className}`}>
    {children}
  </div>
)

interface SubMenuProps {
  children: ReactNode
  innerRef?: React.RefCallback<HTMLDivElement>
  className?: string
}

MenuItems.SubMenu = ({ children, innerRef, className = '' }: SubMenuProps): JSX.Element => (
  <MenuItems
    className={className}
    innerRef={(node: HTMLDivElement | null) => {
      innerRef?.(node)
      if (node?.parentElement != null) {
        node.style.left = `${node.parentElement.getBoundingClientRect().right + 1}px`
      }
    }}>
    {children}
  </MenuItems>
)

export default MenuItems
