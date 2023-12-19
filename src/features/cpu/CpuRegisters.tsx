import type { FC } from 'react'

import { useSelector } from '@/app/store'
import CardHeader from '@/common/components/CardHeader'
import { arrayShallowEqual, invariant, isIn } from '@/common/utils'

import { GeneralPurposeRegister, SpecialPurposeRegisterName } from './core'
import {
  selectCpuGeneralPurposeRegisters,
  selectCpuPointerRegisters,
  selectStatusRegister,
} from './cpuSlice'
import RegisterTableRow from './RegisterTableRow'

const CpuRegisters: FC = () => {
  const gpr = useSelector(selectCpuGeneralPurposeRegisters, arrayShallowEqual)
  const { ip, sp } = useSelector(selectCpuPointerRegisters)
  const sr = useSelector(selectStatusRegister)

  return (
    <div className="border-b">
      <CardHeader title="Registers" />
      <div className="divide-x flex">
        <table className="flex-1">
          <tbody className="divide-y">
            {gpr.map((registerValue, indexAsCode) => {
              const registerName = GeneralPurposeRegister[indexAsCode]
              invariant(isIn(registerName, GeneralPurposeRegister))
              return (
                <RegisterTableRow key={indexAsCode} name={registerName} value={registerValue} />
              )
            })}
          </tbody>
        </table>
        <table className="flex-1">
          <tbody className="divide-y">
            <RegisterTableRow
              name={SpecialPurposeRegisterName.IP}
              value={ip}
              valueClassName="bg-green-100"
            />
            <RegisterTableRow
              name={SpecialPurposeRegisterName.SP}
              value={sp}
              valueClassName="bg-blue-100"
            />
            <RegisterTableRow name={SpecialPurposeRegisterName.SR} value={sr} />
            <RegisterTableRow.FlagIndicator />
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CpuRegisters
