import type { ReactNode } from 'react'

interface Props {
  href: string
  children: ReactNode
  external?: boolean
}

const Link = ({ href, children, external = false }: Props): JSX.Element => (
  <a
    className="text-blue-700 hover:underline"
    href={href}
    {...(external
      ? {
          rel: 'noopener noreferrer',
          target: '_blank'
        }
      : undefined)}>
    {children}
  </a>
)

export default Link
