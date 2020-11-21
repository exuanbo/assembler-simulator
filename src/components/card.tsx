import { ComponentChildren, FunctionalComponent, h } from 'preact'

interface Props {
  title: string
  children?: ComponentChildren
}

const Card: FunctionalComponent<Props> = ({ title, children }: Props) => (
  <div className="card block">
    <header className="card-header">
      <div className="card-header-title">{title}</div>
    </header>
    <div className="card-content">{children}</div>
  </div>
)

export default Card
