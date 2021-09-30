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

interface ExpandedProps {
  children: ReactNode
  innerRef?: React.RefCallback<HTMLDivElement>
  className?: string
}

MenuItems.Expanded = ({ children, innerRef, className = '' }: ExpandedProps): JSX.Element => {
  const ref = (node: HTMLDivElement | null): void => {
    innerRef?.(node)
    if (node?.parentElement != null) {
      node.style.left = `${node.parentElement.getBoundingClientRect().right + /* border */ 1}px`
    }
  }

  return (
    <div ref={ref} className={`divide-y border bg-gray-50 shadow w-60 fixed ${className}`}>
      {children}
    </div>
  )
}

export default MenuItems
