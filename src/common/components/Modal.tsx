import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  children: ReactNode
  isOpen?: boolean
  className?: string
}

const Modal = ({ children, isOpen = false, className = '' }: Props): JSX.Element | null =>
  isOpen
    ? createPortal(
        <div className={`font-mono ${className}`}>{children}</div>,
        document.getElementById('modal-root')!
      )
    : null

export default Modal
