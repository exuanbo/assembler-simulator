import { type ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const modalContainer = document.getElementById('modal-root')!

interface Props {
  children: ReactNode
  isOpen?: boolean
  className?: string
}

const Modal = ({ children, isOpen = false, className = '' }: Props): JSX.Element | null => {
  const [modal, setModal] = useState<HTMLDivElement | null>(null)
  const isReady = isOpen && modal !== null

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const currentModal = Object.assign(document.createElement('div'), { className })
    modalContainer.appendChild(currentModal)
    setModal(currentModal)
    return () => {
      modalContainer.removeChild(currentModal)
      setModal(null)
    }
  }, [isOpen, className])

  return isReady ? createPortal(children, modal) : null
}

export default Modal
