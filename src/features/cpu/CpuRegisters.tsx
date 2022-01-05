import React from 'react'
import Card from '../../common/components/Card'
import RegisterTableRow from './RegisterTableRow'
import { useSelector, useShallowEqualSelector } from '../../app/hooks'
import {
  selectCpuGeneralPurposeRegisters,
  selectCpuPointerRegisters,
  selectStatusRegisterValue
} from './cpuSlice'
import { GeneralPurposeRegister, GeneralPurposeRegisterName } from './core'
import { NO_BREAK_SPACE } from '../../common/constants'

const FlagIndicatorTableRow = React.memo(() => (
  <tr>
    <td>{NO_BREAK_SPACE}</td>
    <td />
    <td>
      <div className="flex space-x-1 justify-center">
        <span className="text-xs px-1">{NO_BREAK_SPACE.repeat(3)}</span>
        <span className="text-sm px-1">{`${NO_BREAK_SPACE.repeat(3)}ISOZ${NO_BREAK_SPACE}`}</span>
      </div>
    </td>
    <td />
  </tr>
))

interface Props {
  className?: string
}

const CpuRegisters = ({ className }: Props): JSX.Element => {
  const gpr = useShallowEqualSelector(selectCpuGeneralPurposeRegisters)
  const { ip, sp } = useShallowEqualSelector(selectCpuPointerRegisters)
  const srValue = useSelector(selectStatusRegisterValue)

  return (
    <Card className={className} title="CPU Registers">
      <div className="divide-x flex">
        <table className="flex-1">
          <tbody className="divide-y">
            {gpr.map((value, index) => {
              const registerName = GeneralPurposeRegister[index] as GeneralPurposeRegisterName
              return <RegisterTableRow key={index} registerName={registerName} value={value} />
            })}
          </tbody>
        </table>
        <table className="flex-1">
          <tbody className="divide-y">
            <RegisterTableRow registerName="IP" value={ip} valueClassName="bg-green-100" />
            <RegisterTableRow registerName="SP" value={sp} valueClassName="bg-blue-100" />
            <RegisterTableRow registerName="SR" value={srValue} />
            <FlagIndicatorTableRow />
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default CpuRegisters
