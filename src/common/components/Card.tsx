import React from 'react'

interface Props {
  children: React.ReactNode
  title: string
  className?: string | undefined
  Icon?: (() => JSX.Element) | undefined
  onIconClick?: (() => void) | undefined
}

const Card = ({ children, title, className, Icon, onIconClick }: Props): JSX.Element => (
  <div className={className}>
    <header className="flex justify-between w-full px-3 py-1 mb-0.5 bg-gray-100 border-b shadow">
      <span>{title}</span>
      {Icon !== undefined ? (
        <button className="flex flex-col justify-center focus:outline-none" onClick={onIconClick}>
          <Icon />
        </button>
      ) : null}
    </header>
    {children}
  </div>
)

export default Card
