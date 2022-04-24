import type { ReactNode } from 'react'

const isExternal = (href: string): boolean => href.startsWith('http')

interface Props {
  href: string
  children: ReactNode
}

const Anchor = ({ href, children }: Props): JSX.Element => (
  <a
    className="text-blue-700 hover:underline"
    href={href}
    {...(isExternal(href)
      ? {
          rel: 'noopener noreferrer',
          target: '_blank'
        }
      : undefined)}>
    {children}
  </a>
)

export default Anchor
