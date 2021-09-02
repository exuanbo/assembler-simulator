import React, { ReactNode } from 'react'

interface Props {
  radixTag: string
  children: ReactNode
}

const RegisterValueTableDataCell = ({ radixTag, children }: Props): JSX.Element => (
  <td className="px-2">
    <div className="flex space-x-1 items-center justify-center">
      <span className="rounded bg-gray-100 text-xs px-1 text-gray-400">{radixTag}</span>
      {children}
    </div>
  </td>
)

export default RegisterValueTableDataCell
