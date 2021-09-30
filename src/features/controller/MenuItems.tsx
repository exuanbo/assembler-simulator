import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

const MenuItems = ({ children, className = '' }: Props): JSX.Element => (
  <div className={`divide-y border bg-gray-50 shadow -ml-1px top-8 fixed ${className}`}>
    {children}
  </div>
)

interface SubMenuProps {
  children: ReactNode
  innerRef?: React.RefCallback<HTMLDivElement>
  className?: string
}

MenuItems.SubMenu = ({ children, innerRef, className = '' }: SubMenuProps): JSX.Element => {
  const ref = (node: HTMLDivElement | null): void => {
    innerRef?.(node)
    if (node?.parentElement != null) {
      node.style.left = `${node.parentElement.getBoundingClientRect().right + /* border */ 1}px`
    }
  }

  return (
    <div ref={ref} className={`divide-y border bg-gray-50 shadow fixed ${className}`}>
      {children}
    </div>
  )
}

export default MenuItems
