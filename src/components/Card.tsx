import React from 'react'

interface Props {
  className?: string
  title: string
  Icon?: () => JSX.Element
  onIconClick?: () => void
}

const Card: React.FC<Props> = ({
  className,
  title,
  Icon,
  onIconClick,
  children
}) => (
  <div className={className}>
    <header className="flex justify-between w-full px-3 py-1 border-b bg-gray-50">
      <span>{title}</span>
      {Icon !== undefined ? (
        <button
          className="flex flex-col justify-center focus:outline-none"
          onClick={onIconClick}>
          <Icon />
        </button>
      ) : null}
    </header>
    {children}
  </div>
)

export default Card
