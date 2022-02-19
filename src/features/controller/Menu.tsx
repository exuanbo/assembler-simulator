import { ReactNode, RefCallback, useEffect } from 'react'
import { useRefCallback, useToggle, useOutsideClick } from '@/common/hooks'

interface Props {
  children: (isOpen: boolean, menuElement: HTMLDivElement) => ReactNode
}

const Menu = ({ children }: Props): JSX.Element => {
  const [menuElement, menuRef] = useRefCallback<HTMLDivElement>()
  const isReady = menuElement !== null

  const [isOpen, toggleOpen] = useToggle(false)
  const [isClickedOutside, outsideClickRef] = useOutsideClick()

  useEffect(() => {
    if (isOpen && isClickedOutside) {
      toggleOpen()
    }
  }, [isOpen, isClickedOutside])

  const refCallback: RefCallback<HTMLDivElement> = element => {
    menuRef(element)
    outsideClickRef(element)
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
