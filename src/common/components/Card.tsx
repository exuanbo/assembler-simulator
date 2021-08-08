import React from 'react'

interface Props {
  children: React.ReactNode
  title: string
  className?: string
  Icon?: () => JSX.Element
  onIconClick?: () => void
}

const Card = ({ children, title, className, Icon, onIconClick }: Props): JSX.Element => (
  <div className={className}>
    <header className="flex justify-between w-full px-3 py-1 border-b bg-gray-50">
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
