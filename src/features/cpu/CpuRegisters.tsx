import type { FC } from 'react'

import { useSelector } from '@/app/store'
import CardHeader from '@/common/components/CardHeader'
import { arrayShallowEqual, invariant, isIn } from '@/common/utils'

import { GeneralPurposeRegister, SpecialPurposeRegisterName } from './core'
import {
  selectCpuGeneralPurposeRegisters,
  selectCpuInstructionPointerRegister,
  selectCpuStackPointerRegister,
  selectStatusRegister,
} from './cpuSlice'
import RegisterTableRow from './RegisterTableRow'

const GeneralPurposeRegisterTableRows: FC = () => {
  const gpr = useSelector(selectCpuGeneralPurposeRegisters, arrayShallowEqual)
  return gpr.map((registerValue, indexAsCode) => {
    const registerName = GeneralPurposeRegister[indexAsCode]
    invariant(isIn(registerName, GeneralPurposeRegister))
    return <RegisterTableRow key={indexAsCode} name={registerName} value={registerValue} />
  })
}

const InstructionPointerRegisterTableRow: FC = () => {
  const ip = useSelector(selectCpuInstructionPointerRegister)
  return (
    <RegisterTableRow
      name={SpecialPurposeRegisterName.IP}
      value={ip}
      valueClassName="bg-green-100"
    />
  )
}

const StackPointerRegisterTableRow: FC = () => {
  const sp = useSelector(selectCpuStackPointerRegister)
  return (
    <RegisterTableRow
      name={SpecialPurposeRegisterName.SP}
      value={sp}
      valueClassName="bg-blue-100"
    />
  )
}

const StatusRegisterTableRow: FC = () => {
  const sr = useSelector(selectStatusRegister)
  return <RegisterTableRow name={SpecialPurposeRegisterName.SR} value={sr} />
}

const CpuRegisters: FC = () => (
  <div className="border-b">
    <CardHeader title="Registers" />
    <div className="divide-x flex">
      <table className="flex-1">
        <tbody className="divide-y">
          <GeneralPurposeRegisterTableRows />
        </tbody>
      </table>
      <table className="flex-1">
        <tbody className="divide-y">
          <InstructionPointerRegisterTableRow />
          <StackPointerRegisterTableRow />
          <StatusRegisterTableRow />
          <RegisterTableRow.FlagIndicator />
        </tbody>
      </table>
    </div>
  </div>
)

export default CpuRegisters
