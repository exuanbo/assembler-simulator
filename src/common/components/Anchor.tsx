import type { FC, PropsWithChildren } from 'react'

const DEFAULT_CLASSNAME = 'text-blue-700 hover:underline'

type Props = PropsWithChildren<{
  href: string
  className?: string
}>

const Anchor: FC<Props> = ({ href, className = DEFAULT_CLASSNAME, children }) => {
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
