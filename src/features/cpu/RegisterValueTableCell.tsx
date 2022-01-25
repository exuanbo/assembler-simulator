import type { ReactNode } from 'react'

export enum RadixLabel {
  Hex = 'hex',
  Bin = 'bin',
  Dec = 'dec'
}

interface Props {
  radixLabel: RadixLabel
  children: ReactNode
}

const RegisterValueTableCell = ({ radixLabel, children }: Props): JSX.Element => (
  <td className="px-2">
    <div className="flex space-x-1 items-center justify-center">
      <span className="rounded bg-gray-100 text-xs px-1 text-gray-400">{radixLabel}</span>
      {children}
    </div>
  </td>
)

export default RegisterValueTableCell
