import { useSelector } from '@/app/store'
import CardHeader from '@/common/components/CardHeader'
import { arrayShallowEqual } from '@/common/utils'

import {
  GeneralPurposeRegister,
  type GeneralPurposeRegisterName,
  SpecialPurposeRegisterName,
} from './core'
import {
  selectCpuGeneralPurposeRegisters,
  selectCpuPointerRegisters,
  selectStatusRegister,
} from './cpuSlice'
import RegisterTableRow from './RegisterTableRow'

const CpuRegisters = (): JSX.Element => {
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
              return (
                <RegisterTableRow
                  key={indexAsCode}
                  name={registerName as GeneralPurposeRegisterName}
                  value={registerValue}
                />
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
