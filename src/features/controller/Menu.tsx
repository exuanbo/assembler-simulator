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
  children: (isOpen: boolean, menuElement: HTMLDivElement) => ReactNode
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

  const refCallback: RefCallback<HTMLDivElement> = element => {
    menuRef(element)
    hoverRef(element)
  }

  return (
    <div
      ref={refCallback}
      className={`flex items-center hover:bg-gray-200 ${isOpen ? 'bg-gray-200' : ''}`}
      onClick={toggleOpen}>
      {isReady && children(isOpen, menuElement)}
    </div>
  )
}

export default Menu
