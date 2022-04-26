import { memo } from 'react'
import RegisterValueTableCell, { RadixLabel } from './RegisterValueTableCell'
import type { RegisterName } from './core'
import { sign8, decToBin, decToHex } from '@/common/utils'
import { NO_BREAK_SPACE } from '@/common/constants'

interface Props {
  name: RegisterName
  value: number
  valueClassName?: string
}

const RegisterTableRow = memo(({ name, value, valueClassName }: Props) => {
  const hexValue = decToHex(value)
  const binValue = decToBin(value)

  const signedValue = sign8(value)
  const decValue = `${signedValue >= 0 ? '+' : '-'}${`${Math.abs(signedValue)}`.padStart(3, '0')}`

  return (
    <tr className="divide-x">
      <td className="bg-gray-50 text-center px-2">{name}</td>
      <RegisterValueTableCell
        label={RadixLabel.Hex}
        value={hexValue}
        valueClassName={valueClassName}
      />
      <RegisterValueTableCell label={RadixLabel.Bin} value={binValue} />
      <RegisterValueTableCell label={RadixLabel.Dec} value={decValue} />
    </tr>
  )
})

if (import.meta.env.DEV) {
  RegisterTableRow.displayName = 'RegisterTableRow'
}

const FlagIndicator = memo(() => (
  <tr>
    <td>{NO_BREAK_SPACE}</td>
    <td />
    <RegisterValueTableCell.FlagIndicator />
    <td />
  </tr>
))

if (import.meta.env.DEV) {
  FlagIndicator.displayName = 'RegisterTableRow.FlagIndicator'
}

export default Object.assign(RegisterTableRow, { FlagIndicator })
