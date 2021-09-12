import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
  title: string
  className?: string | undefined
  Icon?: ((props: Record<string, unknown>) => JSX.Element) | undefined
  onIconClick?: React.MouseEventHandler<HTMLButtonElement> | undefined
}

const Card = ({ children, title, className, Icon, onIconClick }: Props): JSX.Element => (
  <div className={className}>
    <header className="border-b flex bg-gray-100 py-1 px-2 items-center justify-between">
      <span>{title}</span>
      {Icon !== undefined ? (
        <button className="flex items-center focus:outline-none" onClick={onIconClick}>
          <Icon />
        </button>
      ) : null}
    </header>
    {children}
  </div>
)

export default Card
