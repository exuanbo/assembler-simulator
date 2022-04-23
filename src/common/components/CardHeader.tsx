import type { ReactNode } from 'react'

interface Props {
  title: string
  onClick?: React.MouseEventHandler<HTMLElement>
  children?: ReactNode
}

const CardHeader = ({ title, onClick, children }: Props): JSX.Element => (
  <header
    className="border-b flex bg-gray-100 py-1 px-2 items-center justify-between"
    onClick={onClick}>
    <span>{title}</span>
    {children}
  </header>
)

export default CardHeader
