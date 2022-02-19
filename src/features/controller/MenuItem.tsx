import type { ReactNode, RefCallback } from 'react'
import { Play, Share } from '@/common/components/icons'
import { useRefCallback, useHover } from '@/common/hooks'

interface Props {
  children: ReactNode
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

const MenuItem = ({ children, onClick }: Props): JSX.Element => (
  <div className="flex py-1 pr-10 pl-2 items-center hover:bg-gray-200" onClick={onClick}>
    {children}
  </div>
)

const className = 'flex space-x-4 py-1 px-2 items-center justify-between hover:bg-gray-200'

interface ExternalLinkProps {
  href: string
  children: ReactNode
}

MenuItem.ExternalLink = ({ href, children }: ExternalLinkProps): JSX.Element => {
  const handleClick = (): void => {
    window.open(href, '_blank')
  }

  return (
    <div className={className} onClick={handleClick}>
      {children}
      <Share className="fill-gray-400 w-4" />
    </div>
  )
}

interface ExpandableProps {
  children: (
    isHovered: boolean,
    menuItemsRef: RefCallback<HTMLDivElement>,
    menuItemElement: HTMLDivElement
  ) => ReactNode
}

MenuItem.Expandable = ({ children }: ExpandableProps): JSX.Element => {
  const [menuItemElement, menuItemRef] = useRefCallback<HTMLDivElement>()
  const isReady = menuItemElement !== null

  const [isHovered, hoverRef] = useHover<HTMLDivElement>(100)

  const refCallback: RefCallback<HTMLDivElement> = element => {
    menuItemRef(element)
    hoverRef(element)
  }

  const [menuItems, menuItemsRef] = useRefCallback<HTMLDivElement>()

  const handleClick: React.MouseEventHandler<HTMLDivElement> = event => {
    if (menuItems === null) {
      return
    }
    const { target } = event
    if (target instanceof Element && !menuItems.contains(target)) {
      event.stopPropagation()
    }
  }

  return (
    <div ref={refCallback} className={className} onClick={handleClick}>
      {isReady && (
        <>
          <div>{children(isHovered, menuItemsRef, menuItemElement)}</div>
          <div className="w-4">
            <Play className="mx-auto w-2.5" />
          </div>
        </>
      )}
    </div>
  )
}

export default MenuItem
