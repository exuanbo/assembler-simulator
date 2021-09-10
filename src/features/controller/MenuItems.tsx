import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
  innerRef?: React.RefObject<HTMLDivElement>
  className?: string
}

const MenuItems = ({ children, innerRef, className = '' }: Props): JSX.Element => (
  <div ref={innerRef} className={`divide-y border bg-gray-50 shadow fixed ${className}`}>
    {children}
  </div>
)

export default MenuItems
