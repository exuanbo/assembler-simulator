import { ReactNode, useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const containerWrapper = document.getElementById('modal-root')!

interface Props {
  children: ReactNode
  isOpen?: boolean
  className?: string
}

const Modal = ({ children, isOpen = false, className = '' }: Props): JSX.Element | null => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [isContainerReady, setContainerReady] = useState(false)
  const isReady = isOpen && isContainerReady

  useEffect(() => {
    if (!isOpen) {
      return
    }
    if (containerRef.current === null) {
      const container = document.createElement('div')
      container.className = className
      containerRef.current = container
    }
    const currentContainer = containerRef.current
    containerWrapper.appendChild(currentContainer)
    setContainerReady(true)
    return () => {
      containerRef.current = null
      containerWrapper.removeChild(currentContainer)
      setContainerReady(false)
    }
  }, [isOpen, className])

  return isReady ? createPortal(children, containerRef.current!) : null
}

export default Modal
