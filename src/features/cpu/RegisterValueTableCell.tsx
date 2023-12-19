import type { FC } from 'react'

import { NO_BREAK_SPACE } from '@/common/constants'
import { classNames } from '@/common/utils'

export enum RadixLabel {
  Hex = 'hex',
  Bin = 'bin',
  Dec = 'dec',
}

interface Props {
  label: RadixLabel
  value: string
  valueClassName?: string
}

const RegisterValueTableCell: FC<Props> = ({ label, value, valueClassName }) => (
  <td className="px-2">
    <div className="flex space-x-1 items-center justify-center">
      <span className="rounded bg-gray-100 text-xs px-1 text-gray-400">{label}</span>
      <span className={classNames('rounded text-sm px-1', valueClassName)}>{value}</span>
    </div>
  </td>
)

const FlagIndicator: FC = () => (
  <td className="px-2">
    <div className="flex space-x-1 items-center justify-center">
      <span className="text-xs px-1">{NO_BREAK_SPACE.repeat(3)}</span>
      <span className="text-sm px-1">{`${NO_BREAK_SPACE.repeat(3)}ISOZ${NO_BREAK_SPACE}`}</span>
    </div>
  </td>
)

if (import.meta.env.DEV) {
  FlagIndicator.displayName = 'RegisterValueTableCell.FlagIndicator'
}

export default Object.assign(RegisterValueTableCell, { FlagIndicator })
