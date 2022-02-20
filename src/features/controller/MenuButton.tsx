import type { ReactNode, Ref } from 'react'

const className = 'flex space-x-2 items-center'

interface Props {
  children: ReactNode
}

const MenuButton = ({ children }: Props): JSX.Element => <div className={className}>{children}</div>

interface MainProps {
  children: ReactNode
  innerRef?: Ref<HTMLDivElement>
}

MenuButton.Main = ({ children, innerRef }: MainProps): JSX.Element => (
  <div ref={innerRef} className={`${className} h-full px-2`}>
    {children}
  </div>
)

export default MenuButton
