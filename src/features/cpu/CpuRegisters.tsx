import React from 'react'
import Card from '../../common/components/Card'
import RegisterTableRow from './RegisterTableRow'
import { useSelector } from '../../app/hooks'
import { selectCpuRegisters } from './cpuSlice'
import { getFlagsValue } from './core'
import {
  GeneralPurposeRegister,
  GeneralPurposeRegisterName,
  NO_BREAK_SPACE
} from '../../common/constants'

const FlagIndicatorTableRow = (): JSX.Element => (
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
)

interface Props {
  className?: string
}

const CpuRegisters = ({ className }: Props): JSX.Element => {
  const { gpr, ip, sp, sr } = useSelector(selectCpuRegisters)

  return (
    <Card className={className} title="CPU Registers">
      <div className="divide-x flex">
        <table className="flex-1">
          <tbody className="divide-y">
            {gpr.map((value, index) => {
              const registerName = GeneralPurposeRegister[index] as GeneralPurposeRegisterName
              return <RegisterTableRow key={index} name={registerName} value={value} />
            })}
          </tbody>
        </table>
        <table className="flex-1">
          <tbody className="divide-y">
            <RegisterTableRow name="IP" value={ip} valueClassName="bg-green-100" />
            <RegisterTableRow name="SP" value={sp} valueClassName="bg-blue-100" />
            <RegisterTableRow name="SR" value={getFlagsValue(sr)} />
            <FlagIndicatorTableRow />
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default CpuRegisters
