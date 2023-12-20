import type { FC } from 'react'

import { useSelector } from '@/app/store'
import CardHeader from '@/common/components/CardHeader'
import { curryRight2 } from '@/common/utils'

import {
  GeneralPurposeRegister,
  GeneralPurposeRegisterName,
  SpecialPurposeRegisterName,
} from './core'
import {
  selectCpuGeneralPurposeRegister,
  selectCpuInstructionPointerRegister,
  selectCpuStackPointerRegister,
  selectCpuStatusRegister,
} from './cpuSlice'
import RegisterTableRow from './RegisterTableRow'

const AlRegisterTableRow: FC = () => {
  const al = useSelector(curryRight2(selectCpuGeneralPurposeRegister)(GeneralPurposeRegister.AL))
  return <RegisterTableRow name={GeneralPurposeRegisterName.AL} value={al} />
}

const BlRegisterTableRow: FC = () => {
  const bl = useSelector(curryRight2(selectCpuGeneralPurposeRegister)(GeneralPurposeRegister.BL))
  return <RegisterTableRow name={GeneralPurposeRegisterName.BL} value={bl} />
}

const ClRegisterTableRow: FC = () => {
  const cl = useSelector(curryRight2(selectCpuGeneralPurposeRegister)(GeneralPurposeRegister.CL))
  return <RegisterTableRow name={GeneralPurposeRegisterName.CL} value={cl} />
}

const DlRegisterTableRow: FC = () => {
  const dl = useSelector(curryRight2(selectCpuGeneralPurposeRegister)(GeneralPurposeRegister.DL))
  return <RegisterTableRow name={GeneralPurposeRegisterName.DL} value={dl} />
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
  const sr = useSelector(selectCpuStatusRegister)
  return <RegisterTableRow name={SpecialPurposeRegisterName.SR} value={sr} />
}

const CpuRegisters: FC = () => (
  <div className="border-b">
    <CardHeader title="Registers" />
    <div className="divide-x flex">
      <table className="flex-1">
        <tbody className="divide-y">
          <AlRegisterTableRow />
          <BlRegisterTableRow />
          <ClRegisterTableRow />
          <DlRegisterTableRow />
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
