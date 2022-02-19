import type { ReactNode, RefCallback } from 'react'

interface Props {
  children: ReactNode
}

// TODO: pass `menuElement` as prop
const MenuItems = ({ children }: Props): JSX.Element => {
  const refCallback: RefCallback<HTMLDivElement> = element => {
    if (element === null) {
      return
    }
    const menuElement = element.parentElement!
    const { bottom: menuBottom, left: menuLeft } = menuElement.getBoundingClientRect()
    element.style.top = `${menuBottom - /* border: */ 1}px`
    element.style.left = `${menuLeft}px`
  }

  return (
    <div ref={refCallback} className="divide-y border bg-gray-50 shadow fixed">
      {children}
    </div>
  )
}

interface ExpandedProps {
  innerRef: RefCallback<HTMLDivElement>
  menuItemElement: HTMLDivElement
  children: ReactNode
}

MenuItems.Expanded = ({ innerRef, menuItemElement, children }: ExpandedProps): JSX.Element => {
  const refCallback: RefCallback<HTMLDivElement> = element => {
    innerRef(element)
    if (element === null) {
      return
    }
    const { top: menuItemTop, right: menuItemRight } = menuItemElement.getBoundingClientRect()
    const isParentFirstChild = menuItemElement.offsetTop === 0
    element.style.top = `${menuItemTop - (isParentFirstChild ? /* border: */ 1 : 0)}px`
    element.style.left = `${menuItemRight}px`
  }

  return (
    <div ref={refCallback} className="divide-y border bg-gray-50 shadow fixed">
      {children}
    </div>
  )
}

export default MenuItems
