import React from 'react'

interface Props {
  children: React.ReactNode
  onClick: (() => void) | (() => Promise<void>)
}

const ControlButton = ({ children, onClick }: Props): JSX.Element => (
  <button
    className="flex space-x-1 py-1 px-2 items-center hover:(bg-gray-200) focus:outline-none "
    onClick={onClick}>
    {children}
  </button>
)

export default ControlButton
