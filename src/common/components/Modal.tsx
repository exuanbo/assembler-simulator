import { ReactNode, useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const containerWrapper = document.getElementById('modal-root')!

interface Props {
  children: ReactNode
  isOpen?: boolean
  className?: string
}

const Modal = ({ children, isOpen = false, className = '' }: Props): JSX.Element | null => {
  const containerRef = useRef<HTMLDivElement>()

  const [isContainerReady, setContainerReady] = useState(false)
  const isReady = isOpen && isContainerReady

  useEffect(() => {
    if (!isOpen) {
      return
    }
    if (containerRef.current === undefined) {
      const containerElement = document.createElement('div')
      containerElement.className = className
      containerRef.current = containerElement
    }
    const { current: container } = containerRef
    containerWrapper.appendChild(container)
    setContainerReady(true)
    return () => {
      containerWrapper.removeChild(container)
      setContainerReady(false)
    }
  }, [isOpen, className])

  return isReady ? createPortal(children, containerRef.current!) : null
}

export default Modal
