import React, { ReactNode, useEffect } from 'react'
import { useToggle, useOutsideClick } from '../../common/hooks'

interface Props {
  children: (isOpen: boolean, toggleOpen: React.DispatchWithoutAction) => ReactNode
}

const Menu = ({ children }: Props): JSX.Element => {
  const [isOpen, toggleOpen] = useToggle(false)
  const [isClicked, clickRef] = useOutsideClick<HTMLDivElement>()

  useEffect(() => {
    if (isOpen && isClicked) {
      toggleOpen()
    }
  }, [isOpen, isClicked])

  return (
    <div
      ref={clickRef}
      className={`flex items-center hover:bg-gray-200 ${isOpen ? 'bg-gray-200' : ''}`}
      onClick={toggleOpen}>
      {children(isOpen, toggleOpen)}
    </div>
  )
}

export default Menu
