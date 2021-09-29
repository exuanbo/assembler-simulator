import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string | undefined
}

const MenuButton = ({ children, className = '' }: Props): JSX.Element => (
  <div className={`flex space-x-2 items-center ${className}`}>{children}</div>
)

MenuButton.Main = ({ children }: Props) => <MenuButton className="py-1 px-2">{children}</MenuButton>

export default MenuButton
