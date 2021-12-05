import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
  onClick: React.MouseEventHandler<HTMLDivElement>
}

const ControlButton = ({ children, onClick }: Props): JSX.Element => (
  <div className="flex space-x-2 py-1 px-2 items-center hover:bg-gray-200" onClick={onClick}>
    {children}
  </div>
)

export default ControlButton
