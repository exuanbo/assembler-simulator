import { ReactNode, RefCallback, createContext, useEffect, useContext } from 'react'
import { useRefCallback, useHover } from '@/common/hooks'
import { noop } from '@/common/utils'

interface MenuContextValue {
  currentOpen: HTMLDivElement | null
  setCurrentOpen: (menuElement: HTMLDivElement | null) => void
}

export const MenuContext = createContext<MenuContextValue>({
  currentOpen: null,
  setCurrentOpen: noop
})

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

  const [isHovered, hoverRef] = useHover()

  useEffect(() => {
    const hasOtherOpen = currentOpen !== null && currentOpen !== menuElement
    if (hasOtherOpen && isHovered) {
      setCurrentOpen(menuElement)
    }
  }, [currentOpen, menuElement, isHovered])

  return (
    <div
      ref={menuRef}
      className={`flex items-center hover:bg-gray-200 ${isOpen ? 'bg-gray-200' : ''}`}
      onClick={toggleOpen}>
      {isReady && children(isOpen, hoverRef, menuElement)}
    </div>
  )
}

export default Menu
