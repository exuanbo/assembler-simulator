import type { ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  className?: string
  icon?: JSX.Element
}

const Card = ({ title, children, className, icon }: Props): JSX.Element => (
  <div className={className}>
    <header className="border-b flex bg-gray-100 py-1 px-2 items-center justify-between">
      <span>{title}</span>
      {icon}
    </header>
    {children}
  </div>
)

export default Card
