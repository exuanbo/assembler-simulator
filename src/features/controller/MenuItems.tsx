import type { ReactNode, RefCallback } from 'react'

const BORDER_WIDTH = 1

const className = 'divide-y border bg-gray-50 shadow fixed'

interface Props {
  menuElement: HTMLDivElement
  children: ReactNode
}

const MenuItems = ({ menuElement, children }: Props): JSX.Element => {
  const refCallback: RefCallback<HTMLDivElement> = (element) => {
    if (element === null) {
      return
    }
    const { bottom: menuBottom, left: menuLeft } = menuElement.getBoundingClientRect()
    element.style.top = `${menuBottom - BORDER_WIDTH}px`
    element.style.left = `${menuLeft}px`
  }

  return (
    <div ref={refCallback} className={className}>
      {children}
    </div>
  )
}

interface ExpandedProps {
  innerRef: RefCallback<HTMLDivElement>
  menuItemElement: HTMLDivElement
  children: ReactNode
}

const Expanded = ({ innerRef, menuItemElement, children }: ExpandedProps): JSX.Element => {
  const refCallback: RefCallback<HTMLDivElement> = (element) => {
    innerRef(element)
    if (element === null) {
      return
    }
    const { top: menuItemTop, right: menuItemRight } = menuItemElement.getBoundingClientRect()
    const isParentFirstChild = menuItemElement.offsetTop === 0
    element.style.top = `${menuItemTop - (isParentFirstChild ? BORDER_WIDTH : 0)}px`
    element.style.left = `${menuItemRight}px`
  }

  return (
    <div ref={refCallback} className={className}>
      {children}
    </div>
  )
}

if (import.meta.env.DEV) {
  Expanded.displayName = 'MenuItems.Expanded'
}

export default Object.assign(MenuItems, { Expanded })
