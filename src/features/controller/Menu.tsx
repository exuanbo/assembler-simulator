import { ReactNode, RefCallback, useEffect } from 'react'
import { useRefCallback, useToggle, useOutsideClick } from '@/common/hooks'

interface Props {
  children: (isOpen: boolean, menuElement: HTMLDivElement) => ReactNode
}

const Menu = ({ children }: Props): JSX.Element => {
  const [menuElement, menuRef] = useRefCallback<HTMLDivElement>()
  const isReady = menuElement !== null

  const [isOpen, toggleOpen] = useToggle(false)
  const [isClicked, clickRef] = useOutsideClick()

  useEffect(() => {
    if (isOpen && isClicked) {
      toggleOpen()
    }
  }, [isOpen, isClicked])

  const refCallback: RefCallback<HTMLDivElement> = element => {
    menuRef(element)
    clickRef(element)
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
