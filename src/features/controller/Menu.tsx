import { ReactNode, RefCallback, createContext, useContext, useCallback } from 'react'
import { useRefCallback, useHover } from '@/common/hooks'
import { noop, classNames } from '@/common/utils'

interface MenuContextValue {
  currentOpen: HTMLDivElement | null
  setCurrentOpen: (menuElement: HTMLDivElement | null) => void
}

export const MenuContext = createContext<MenuContextValue>({
  currentOpen: null,
  setCurrentOpen: noop
})

if (import.meta.env.DEV) {
  MenuContext.displayName = 'MenuContext'
}

interface Props {
  children: (
    isOpen: boolean,
    hoverRef: RefCallback<HTMLDivElement>,
    menuElement: HTMLDivElement
  ) => ReactNode
}

const Menu = ({ children }: Props): JSX.Element => {
  const [menuElement, menuRef] = useRefCallback<HTMLDivElement>()
  const isReady = menuElement !== null

  const { currentOpen, setCurrentOpen } = useContext(MenuContext)
  const isOpen = currentOpen !== null && currentOpen === menuElement

  const toggleOpen = (): void => {
    setCurrentOpen(isOpen ? null : menuElement)
  }

  const handleHover = useCallback(
    (isHovered: boolean) => {
      const hasOtherOpen = currentOpen !== null && currentOpen !== menuElement
      if (hasOtherOpen && isHovered) {
        setCurrentOpen(menuElement)
      }
    },
    [currentOpen, menuElement]
  )

  const hoverRef = useHover(handleHover)

  return (
    <div
      ref={menuRef}
      className={classNames('flex items-center hover:bg-gray-200', { 'bg-gray-200': isOpen })}
      onClick={toggleOpen}>
      {isReady && children(isOpen, hoverRef, menuElement)}
    </div>
  )
}

export default Menu
