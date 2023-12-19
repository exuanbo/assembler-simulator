import type { FC, PropsWithChildren, RefCallback } from 'react'

const BORDER_WIDTH = 1

const className = 'divide-y border bg-gray-50 shadow fixed'

type Props = PropsWithChildren<{
  menuElement: HTMLDivElement
}>

const MenuItems: FC<Props> = ({ menuElement, children }) => {
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

type ExpandedProps = PropsWithChildren<{
  innerRef: RefCallback<HTMLDivElement>
  menuItemElement: HTMLDivElement
}>

const Expanded: FC<ExpandedProps> = ({ innerRef, menuItemElement, children }) => {
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
