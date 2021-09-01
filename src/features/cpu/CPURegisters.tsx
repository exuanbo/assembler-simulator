import React from 'react'
import Card from '../../common/components/Card'
import { useAppSelector } from '../../app/hooks'
import { selectRegisters } from './cpuSlice'
import { getFlagsValue } from './core'
import { GeneralPurposeRegister } from '../../common/constants'
import { sign8, decToHex } from '../../common/utils'

const RegisterValueTableDataCell = ({
  radixLabel,
  valueStr
}: {
  radixLabel: string
  valueStr: string
}): JSX.Element => (
  <td className="px-2">
    <div className="flex items-center justify-center space-x-2">
      <span className="px-1 text-xs text-gray-400 bg-gray-100">{radixLabel}</span>
      <span>{valueStr}</span>
    </div>
  </td>
)

const RegisterTableRow = ({ name, value }: { name: string; value: number }): JSX.Element => {
  const signedValue = sign8(value)

  return (
    <tr className="divide-x">
      <td className="px-2 text-center bg-gray-50">{name}</td>
      <RegisterValueTableDataCell radixLabel="hex" valueStr={decToHex(value)} />
      <RegisterValueTableDataCell radixLabel="bin" valueStr={value.toString(2).padStart(8, '0')} />
      <RegisterValueTableDataCell
        radixLabel="dec"
        valueStr={`${signedValue >= 0 ? '+' : '-'}${`${Math.abs(signedValue)}`.padStart(3, '0')}`}
      />
    </tr>
  )
}

const NO_BREAK_SPACE = '\u00A0'

const FlagIndicatorTableRow = (): JSX.Element => (
  <tr>
    <td />
    <td />
    <td className="px-2">
      <div className="flex items-center justify-center space-x-2">
        <span className="px-1 text-xs">{NO_BREAK_SPACE.repeat(3)}</span>
        <span>{`${NO_BREAK_SPACE.repeat(3)}ISOZ${NO_BREAK_SPACE}`}</span>
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
              return <RegisterTableRow key={registerName} name={registerName} value={value} />
            })}
          </tbody>
        </table>
        <table className="flex-1">
          <tbody className="divide-y">
            <RegisterTableRow name="IP" value={ip} />
            <RegisterTableRow name="SP" value={sp} />
            <RegisterTableRow name="SR" value={getFlagsValue(sr)} />
            <FlagIndicatorTableRow />
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default CPURegisters
