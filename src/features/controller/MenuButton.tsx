import type { ReactNode, Ref } from 'react'
import { classNames } from '@/common/utils'

const className = 'flex space-x-2 items-center'

interface Props {
  children: ReactNode
}

const MenuButton = ({ children }: Props): JSX.Element => <div className={className}>{children}</div>

interface MainProps {
  children: ReactNode
  innerRef?: Ref<HTMLDivElement>
}

const Main = ({ children, innerRef }: MainProps): JSX.Element => (
  <div ref={innerRef} className={classNames(className, 'py-1 px-2')}>
    {children}
  </div>
)

if (import.meta.env.DEV) {
  Main.displayName = 'MenuButton.Main'
}

export default Object.assign(MenuButton, { Main })
