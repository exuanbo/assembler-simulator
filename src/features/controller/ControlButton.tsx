import React from 'react'

interface Props {
  children: React.ReactNode
  onClick: () => void
}

const ControlButton = ({ children, onClick }: Props): JSX.Element => (
  <button
    className="flex space-x-1 py-1 px-2 items-center hover:(bg-light-blue-600 text-light-100 fill-light-100) focus:outline-none "
    onClick={onClick}>
    {children}
  </button>
)

export default ControlButton
