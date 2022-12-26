import { ReactNode, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

const containerWrapper = document.getElementById('modal-root')!

interface Props {
  children: ReactNode
  isOpen?: boolean
  className?: string
}

const Modal = ({ children, isOpen = false, className = '' }: Props): JSX.Element | null => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const isReady = isOpen && container !== null

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const currentContainer = Object.assign(document.createElement('div'), { className })
    containerWrapper.appendChild(currentContainer)
    setContainer(currentContainer)
    return () => {
      containerWrapper.removeChild(currentContainer)
      setContainer(null)
    }
  }, [isOpen, className])

  return isReady ? createPortal(children, container) : null
}

export default Modal
