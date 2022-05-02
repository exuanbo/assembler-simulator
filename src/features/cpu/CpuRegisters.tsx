import CardHeader from '@/common/components/CardHeader'
import RegisterTableRow from './RegisterTableRow'
import { useSelector } from '@/app/hooks'
import {
  selectCpuGeneralPurposeRegisters,
  selectCpuPointerRegisters,
  selectStatusRegisterValue
} from './cpuSlice'
import {
  GeneralPurposeRegister,
  GeneralPurposeRegisterName,
  SpecialPurposeRegisterName
} from './core'
import { compareArrayWithSameLength } from '@/common/utils'

const CpuRegisters = (): JSX.Element => {
  const gpr = useSelector(selectCpuGeneralPurposeRegisters, compareArrayWithSameLength)
  const { ip, sp } = useSelector(selectCpuPointerRegisters)
  const srValue = useSelector(selectStatusRegisterValue)

  return (
    <div className="border-b">
      <CardHeader title="Registers" />
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
            <RegisterTableRow name={SpecialPurposeRegisterName.SR} value={srValue} />
            <RegisterTableRow.FlagIndicator />
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CpuRegisters
