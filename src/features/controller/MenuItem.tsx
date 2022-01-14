import { ReactNode, RefCallback, useState, useCallback } from 'react'
import { Play } from '@/common/components/icons'
import { useHover } from '@/common/hooks'

interface Props {
  children: ReactNode
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

const MenuItem = ({ children, onClick }: Props): JSX.Element => (
  <div className="flex py-1 pr-10 pl-2 items-center hover:bg-gray-200" onClick={onClick}>
    {children}
  </div>
)

interface ExpandableProps {
  children: (isHovered: boolean, menuItemsRef: RefCallback<HTMLDivElement>) => ReactNode
}

MenuItem.Expandable = ({ children }: ExpandableProps): JSX.Element => {
  const [isHovered, hoverRef] = useHover<HTMLDivElement>()
  const [menuItems, setMenuItems] = useState<HTMLDivElement | null>(null)

  const handleClick: React.MouseEventHandler<HTMLDivElement> = event => {
    if (menuItems === null) {
      return
    }
    const { target } = event
    if (target instanceof Element && !menuItems.contains(target)) {
      event.stopPropagation()
    }
  }

  const menuItemsRef = useCallback<RefCallback<HTMLDivElement>>(node => {
    setMenuItems(node)
  }, [])

  return (
    <div
      ref={hoverRef}
      className="flex py-1 px-2 items-center justify-between hover:bg-gray-200"
      onClick={handleClick}>
      {children(isHovered, menuItemsRef)}
      <div className="flex ml-4 w-4 justify-end">
        <Play className="w-2.5" />
      </div>
    </div>
  )
}

export default MenuItem
