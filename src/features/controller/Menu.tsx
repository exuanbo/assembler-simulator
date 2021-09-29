import React, { ReactNode } from 'react'
import { useToggle, useOutsideClick } from '../../common/hooks'

interface Props {
  children: (isOpen: boolean) => ReactNode
}

const Menu = ({ children }: Props): JSX.Element => {
  const [isOpen, toggleOpen] = useToggle(false)
  const [isClicked, clickRef] = useOutsideClick<HTMLDivElement>()

  if (isOpen && isClicked) {
    toggleOpen()
  }

  return (
    <div
      ref={clickRef}
      className={`cursor-pointer flex py-1 px-2 items-center hover:bg-gray-200 ${
        isOpen ? 'bg-gray-200' : ''
      }`}
      onClick={toggleOpen}>
      {children(isOpen)}
    </div>
  )
}

export default Menu
