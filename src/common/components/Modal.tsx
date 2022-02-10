import { ReactNode, useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const modalRoot = document.getElementById('modal-root')!

interface Props {
  children: ReactNode
  isOpen?: boolean
  className?: string
}

const Modal = ({ children, isOpen = false, className = '' }: Props): JSX.Element | null => {
  const wrapperElementRef = useRef<HTMLDivElement>()
  const [isWrapperElementReady, setWrapperElementReady] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }
    if (wrapperElementRef.current === undefined) {
      const wrapperElement = document.createElement('div')
      wrapperElement.className = className
      wrapperElementRef.current = wrapperElement
    }
    const { current: wrapperElement } = wrapperElementRef
    modalRoot.appendChild(wrapperElement)
    setWrapperElementReady(true)
    return () => {
      modalRoot.removeChild(wrapperElement)
      setWrapperElementReady(false)
    }
  }, [isOpen])

  return isOpen && isWrapperElementReady ? createPortal(children, wrapperElementRef.current!) : null
}

export default Modal
