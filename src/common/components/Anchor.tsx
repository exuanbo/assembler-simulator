import type { ReactNode } from 'react'

interface Props {
  href: string
  children: ReactNode
}

const Anchor = ({ href, children }: Props): JSX.Element => {
  const isExternal = href.startsWith('http')
  return (
    <a
      className="text-blue-700 hover:underline"
      href={href}
      {...(isExternal
        ? {
            rel: 'noopener noreferrer',
            target: '_blank'
          }
        : {})}>
      {children}
    </a>
  )
}

export default Anchor
