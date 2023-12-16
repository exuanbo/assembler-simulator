import { type FC, type PropsWithChildren, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { type ClassItem, mergeClassNames } from '../utils'

const modalContainer = document.getElementById('modal-root')!

const modalClassName = 'fixed inset-0 flex items-center justify-center'

interface Props {
  className?: ClassItem
  isOpen?: boolean
}

const Modal: FC<PropsWithChildren<Props>> = ({ children, className, isOpen = false }) => {
  const [currentModal, setCurrentModal] = useState<HTMLDivElement | null>(null)
  const isReady = isOpen && !!currentModal

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const modal = Object.assign(document.createElement('div'), {
      className: mergeClassNames(modalClassName, className),
    })
    modalContainer.appendChild(modal)
    setCurrentModal(modal)
    return () => {
      modalContainer.removeChild(modal)
      setCurrentModal(null)
    }
  }, [isOpen, className])

  return isReady && createPortal(children, currentModal)
}

export default Modal
