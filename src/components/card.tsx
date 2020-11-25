import { ComponentChildren, FunctionalComponent, h } from 'preact'

interface Props {
  className?: string
  title: string
  Icon?: () => h.JSX.Element
  onIconClick?: () => void
  children?: ComponentChildren
  [prop: string]: unknown
}

const Card: FunctionalComponent<Props> = ({
  className,
  title,
  Icon,
  onIconClick,
  children,
  ...props
}: Props) => (
  <div className={`card block ${className ?? ''}`} {...props}>
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
