import type { ReactNode } from 'react'

const DEFAULT_CLASSNAME = 'text-blue-700 hover:underline'

interface Props {
  href: string
  children: ReactNode
  className?: string
}

const Anchor = ({ href, children, className = DEFAULT_CLASSNAME }: Props): JSX.Element => {
  const isExternal = href.startsWith('http')
  return (
    <a
      className={className}
      href={href}
      {...(isExternal
        ? {
            rel: 'noopener noreferrer',
            target: '_blank',
          }
        : {})}>
      {children}
    </a>
  )
}

export default Anchor
