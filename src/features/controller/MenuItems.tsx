import type { ReactNode, RefCallback } from 'react'

interface Props {
  children: ReactNode
}

const MenuItems = ({ children }: Props): JSX.Element => {
  const refCallback: RefCallback<HTMLDivElement> = node => {
    if (node === null) {
      return
    }
    const { bottom: parentBottom, left: parentLeft } = node.parentElement!.getBoundingClientRect()
    node.style.top = `${parentBottom - /* border: */ 1}px`
    node.style.left = `${parentLeft}px`
  }

  return (
    <div ref={refCallback} className="divide-y border bg-gray-50 shadow fixed">
      {children}
    </div>
  )
}

interface ExpandedProps {
  innerRef: RefCallback<HTMLDivElement>
  menuItem: HTMLDivElement
  children: ReactNode
}

MenuItems.Expanded = ({ innerRef, menuItem, children }: ExpandedProps): JSX.Element => {
  const refCallback: RefCallback<HTMLDivElement> = node => {
    innerRef(node)
    if (node === null) {
      return
    }
    const { top: menuItemTop, right: menuItemRight } = menuItem.getBoundingClientRect()
    const isParentFirstChild = menuItem.offsetTop === 0
    node.style.top = `${menuItemTop - (isParentFirstChild ? /* border: */ 1 : 0)}px`
    node.style.left = `${menuItemRight}px`
  }

  return (
    <div ref={refCallback} className="divide-y border bg-gray-50 shadow fixed">
      {children}
    </div>
  )
}

export default MenuItems
