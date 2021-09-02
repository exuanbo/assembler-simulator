import React from 'react'
import Card from '../../common/components/Card'
import { useAppSelector } from '../../app/hooks'
import { selectRegisters } from './cpuSlice'
import { getFlagsValue } from './core'
import { GeneralPurposeRegister } from '../../common/constants'
import { sign8, decToHex } from '../../common/utils'

const RegisterValueTableDataCell = ({
  radixLabel,
  value,
  valueClassName = ''
}: {
  radixLabel: string
  value: string
  valueClassName?: string | undefined
}): JSX.Element => (
  <td className="px-2">
    <div className="flex items-center justify-center space-x-1">
      <span className="px-1 text-xs text-gray-400 bg-gray-100 rounded">{radixLabel}</span>
      <span className={`px-1 text-sm rounded ${valueClassName}`}>{value}</span>
    </div>
  </td>
)

const RegisterTableRow = ({
  registerName,
  value,
  valueClassName
}: {
  registerName: string
  value: number
  valueClassName?: string
}): JSX.Element => {
  const signedValue = sign8(value)

  return (
    <tr className="divide-x">
      <td className="px-2 text-center bg-gray-50">{registerName}</td>
      <RegisterValueTableDataCell
        radixLabel="hex"
        value={decToHex(value)}
        valueClassName={valueClassName}
      />
      <RegisterValueTableDataCell radixLabel="bin" value={value.toString(2).padStart(8, '0')} />
      <RegisterValueTableDataCell
        radixLabel="dec"
        value={`${signedValue >= 0 ? '+' : '-'}${`${Math.abs(signedValue)}`.padStart(3, '0')}`}
      />
    </tr>
  )
}

const NO_BREAK_SPACE = '\u00A0'

const FlagIndicatorTableRow = (): JSX.Element => (
  <tr>
    <td>{NO_BREAK_SPACE}</td>
    <td />
    <td>
      <div className="flex justify-center space-x-1">
        <span className="px-1 text-xs">{NO_BREAK_SPACE.repeat(3)}</span>
        <span className="px-1 text-sm">{`${NO_BREAK_SPACE.repeat(3)}ISOZ${NO_BREAK_SPACE}`}</span>
      </div>
    </td>
  </tr>
)

interface Props {
  className?: string
}

const CPURegisters = ({ className }: Props): JSX.Element => {
  const { gpr, ip, sp, sr } = useAppSelector(selectRegisters)

  return (
    <Card className={className} title="CPU Registers">
      <div className="flex font-mono">
        <table className="flex-1 border-r-1">
          <tbody className="divide-y">
            {gpr.map((value, index) => {
              const registerName = GeneralPurposeRegister[index]
              return <RegisterTableRow key={index} registerName={registerName} value={value} />
            })}
          </tbody>
        </table>
        <table className="flex-1">
          <tbody className="divide-y">
            <RegisterTableRow registerName="IP" value={ip} valueClassName="bg-green-100" />
            <RegisterTableRow registerName="SP" value={sp} valueClassName="bg-blue-100" />
            <RegisterTableRow registerName="SR" value={getFlagsValue(sr)} />
            <FlagIndicatorTableRow />
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default CPURegisters
