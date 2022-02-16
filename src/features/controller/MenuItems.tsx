import type { ReactNode, RefCallback } from 'react'

interface Props {
  children: ReactNode
}

const MenuItems = ({ children }: Props): JSX.Element => {
  const refCallback: RefCallback<HTMLDivElement> = node => {
    if (node === null) {
      return
    }
    const { left: parentLeft } = node.parentElement!.getBoundingClientRect()
    node.style.left = `${parentLeft}px`
  }

  return (
    <div
      ref={refCallback}
      className="divide-y border-r border-b border-l bg-gray-50 shadow-md top-8 fixed">
      {children}
    </div>
  )
}

interface ExpandedProps {
  innerRef: RefCallback<HTMLDivElement>
  children: ReactNode
}

MenuItems.Expanded = ({ innerRef, children }: ExpandedProps): JSX.Element => {
  const refCallback: RefCallback<HTMLDivElement> = node => {
    innerRef(node)
    if (node === null) {
      return
    }
    const parentElement /* :MenuItem.Expandable */ = node.parentElement!
    const { top: parentTop, right: parentRight } = parentElement.getBoundingClientRect()
    const isParentFirstChild = parentElement.offsetTop === 0
    node.style.top = `${parentTop - (isParentFirstChild ? /* border: */ 1 : 0)}px`
    node.style.left = `${parentRight + /* border: */ 1}px`
  }

  return (
    <div ref={refCallback} className="divide-y border bg-gray-50 shadow-md fixed">
      {children}
    </div>
  )
}

export default MenuItems
