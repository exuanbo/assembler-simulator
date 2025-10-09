import type { FC, PropsWithChildren, Ref } from 'react'

import { classNames } from '@/common/utils'

const className = 'flex h-full space-x-2 items-center'

const MenuButton: FC<PropsWithChildren> = ({ children }) => (
  <div className={className}>{children}</div>
)

type Props = PropsWithChildren<{
  ref?: Ref<HTMLDivElement>
}>

const Main: FC<Props> = ({ ref, children }) => (
  <div ref={ref} className={classNames(className, 'py-1 px-2 hover:active:bg-gray-300')}>
    {children}
  </div>
)

if (import.meta.env.DEV) {
  Main.displayName = 'MenuButton.Main'
}

export default Object.assign(MenuButton, { Main })
