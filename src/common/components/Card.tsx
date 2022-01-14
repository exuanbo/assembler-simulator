import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  title: string
  className?: string
  Icon?: (props: Record<string, unknown>) => JSX.Element
  onIconClick?: React.MouseEventHandler<HTMLDivElement>
}

const Card = ({ children, title, className, Icon, onIconClick }: Props): JSX.Element => (
  <div className={className}>
    <header className="border-b flex bg-gray-100 py-1 px-2 items-center justify-between">
      <span>{title}</span>
      {Icon !== undefined && (
        <div className="flex items-center" onClick={onIconClick}>
          <Icon />
        </div>
      )}
    </header>
    {children}
  </div>
)

export default Card
