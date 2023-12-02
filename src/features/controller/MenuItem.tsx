import { ReactNode, RefCallback, useState } from 'react'

import Anchor from '@/common/components/Anchor'
import { Play, Share } from '@/common/components/icons'
import { useHover, useRefCallback } from '@/common/hooks'

const className = 'flex space-x-4 py-1 px-2 items-center justify-between hover:bg-gray-200'

interface Props {
  onClick: React.MouseEventHandler<HTMLDivElement>
  children: ReactNode
}

const MenuItem = ({ onClick, children }: Props): JSX.Element => (
  <div className={className} onClick={onClick}>
    {children}
    <span className="w-4" />
  </div>
)

interface ExternalLinkProps {
  href: string
  children: ReactNode
}

const ExternalLink = ({ href, children }: ExternalLinkProps): JSX.Element => (
  <Anchor className={className} href={href}>
    {children}
    <div className="w-4">
      <Share className="mx-auto fill-gray-400" width="0.875rem" />
    </div>
  </Anchor>
)

if (import.meta.env.DEV) {
  ExternalLink.displayName = 'MenuItem.ExternalLink'
}

interface ExpandableProps {
  children: (
    isHovered: boolean,
    menuItemsRef: RefCallback<HTMLDivElement>,
    menuItemElement: HTMLDivElement,
  ) => ReactNode
}

const Expandable = ({ children }: ExpandableProps): JSX.Element => {
  const [menuItemElement, menuItemRef] = useRefCallback<HTMLDivElement>()
  const isReady = menuItemElement !== null

  const [isHovered, setHovered] = useState(false)
  const hoverRef = useHover(setHovered, /* delay: */ 100)

  const refCallback: RefCallback<HTMLDivElement> = (element) => {
    menuItemRef(element)
    hoverRef(element)
  }

  const [menuItems, menuItemsRef] = useRefCallback<HTMLDivElement>()

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (menuItems === null || !menuItems.contains(event.target as Element)) {
      event.stopPropagation()
    }
  }

  return (
    <div ref={refCallback} className={className} onClick={handleClick}>
      {isReady && (
        <>
          <div>{children(isHovered, menuItemsRef, menuItemElement)}</div>
          <div className="w-4">
            <Play className="mx-auto" width="0.625rem" />
          </div>
        </>
      )}
    </div>
  )
}

if (import.meta.env.DEV) {
  Expandable.displayName = 'MenuItem.Expandable'
}

export default Object.assign(MenuItem, { ExternalLink, Expandable })
