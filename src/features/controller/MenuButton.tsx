import type { ReactNode } from 'react'

const className = 'flex space-x-2 items-center'

interface Props {
  children: ReactNode
}

const MenuButton = ({ children }: Props): JSX.Element => <div className={className}>{children}</div>

MenuButton.Main = ({ children }: Props): JSX.Element => (
  <div className={`${className} px-2`}>{children}</div>
)

export default MenuButton
