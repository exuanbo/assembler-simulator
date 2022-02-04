import type { ReactNode, RefCallback } from 'react'

interface Props {
  children: ReactNode
}

const MenuItems = ({ children }: Props): JSX.Element => (
  <div className="divide-y border bg-gray-50 shadow-md -ml-1px top-8 fixed">{children}</div>
)

interface ExpandedProps {
  innerRef: RefCallback<HTMLDivElement>
  children: ReactNode
}

MenuItems.Expanded = ({ innerRef, children }: ExpandedProps): JSX.Element => {
  const refCallback: RefCallback<HTMLDivElement> = node => {
    innerRef(node)
    if (node?.parentElement != null) {
      // MenuItem.Expandable
      const { parentElement } = node
      const { top: parentTop, right: parentRight } = parentElement.getBoundingClientRect()
      const isParentFirstChild = parentElement.offsetTop === 0
      node.style.top = `${parentTop - (isParentFirstChild ? /* border */ 1 : 0)}px`
      node.style.left = `${parentRight + /* border */ 1}px`
    }
  }

  return (
    <div ref={refCallback} className="divide-y border bg-gray-50 shadow-md fixed">
      {children}
    </div>
  )
}

export default MenuItems
