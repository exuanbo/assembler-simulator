import { ComponentChildren, FunctionalComponent, h } from 'preact'

interface Props {
  className?: string
  title: string
  Icon?: () => h.JSX.Element
  onIconClick?: () => void
  children?: ComponentChildren
}

const Card: FunctionalComponent<Props> = ({
  className,
  title,
  Icon,
  onIconClick,
  children
}: Props) => (
  <div
    className={`card block${className !== undefined ? ` ${className}` : ''}`}>
    <header className="card-header">
      <span className="card-header-title">{title}</span>
      {Icon !== undefined ? (
        <span className="card-header-icon" onClick={onIconClick}>
          <Icon />
        </span>
      ) : null}
    </header>
    {children !== undefined ? (
      <div className="card-content">{children}</div>
    ) : null}
  </div>
)

export default Card
