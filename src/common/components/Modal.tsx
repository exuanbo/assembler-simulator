import { type FC, type PropsWithChildren, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { type ClassItem, mergeClassNames } from '../utils'

const modalContainer = document.getElementById('modal-root')!

const modalClassName = 'fixed inset-0 flex items-center justify-center'

type Props = PropsWithChildren<{
  className?: ClassItem
  isOpen?: boolean
}>

const Modal: FC<Props> = ({ className, isOpen = false, children }) => {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentModal(modal)
    return () => {
      modalContainer.removeChild(modal)
      setCurrentModal(null)
    }
  }, [isOpen, className])

  return isReady && createPortal(children, currentModal)
}

export default Modal
