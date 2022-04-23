import type { ReactNode } from 'react'
import { NO_BREAK_SPACE } from '@/common/constants'

export enum RadixLabel {
  Hex = 'hex',
  Bin = 'bin',
  Dec = 'dec'
}

interface Props {
  children: ReactNode
  radixLabel?: RadixLabel
}

const RegisterValueTableCell = ({ children, radixLabel }: Props): JSX.Element => (
  <td className="px-2">
    <div className="flex space-x-1 items-center justify-center">
      {radixLabel === undefined ? (
        <span className="text-xs px-1">{NO_BREAK_SPACE.repeat(3)}</span>
      ) : (
        <span className="rounded bg-gray-100 text-xs px-1 text-gray-400">{radixLabel}</span>
      )}
      {children}
    </div>
  </td>
)

export default RegisterValueTableCell
