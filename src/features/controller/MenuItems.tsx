import React, { ReactNode, RefCallback } from 'react'

interface Props {
  children: ReactNode
}

const MenuItems = ({ children }: Props): JSX.Element => (
  <div className="divide-y border bg-gray-50 shadow -ml-1px top-8 fixed">{children}</div>
)

interface ExpandedProps {
  children: ReactNode
  innerRef?: RefCallback<HTMLDivElement>
  className?: string
}

MenuItems.Expanded = ({ children, innerRef, className = '' }: ExpandedProps): JSX.Element => {
  const refCallback: RefCallback<HTMLDivElement> = node => {
    innerRef?.(node)
    if (node?.parentElement != null) {
      node.style.left = `${node.parentElement.getBoundingClientRect().right + /* border */ 1}px`
    }
  }

  return (
    <div ref={refCallback} className={`divide-y border bg-gray-50 shadow fixed ${className}`}>
      {children}
    </div>
  )
}

export default MenuItems
