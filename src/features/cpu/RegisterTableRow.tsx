import React from 'react'
import RegisterValueTableDataCell from './RegisterValueTableCell'
import type { GeneralPurposeRegisterName } from './core'
import { sign8, decToHex } from '../../common/utils'

type RegisterName = GeneralPurposeRegisterName | 'IP' | 'SP' | 'SR'

interface Props {
  registerName: RegisterName
  value: number
  valueClassName?: string
}

const RegisterTableRow = ({ registerName, value, valueClassName = '' }: Props): JSX.Element => {
  const signedValue = sign8(value)
  const hexValue = decToHex(value)
  const binValue = value.toString(2).padStart(8, '0')
  const decValue = `${signedValue >= 0 ? '+' : '-'}${`${Math.abs(signedValue)}`.padStart(3, '0')}`

  return (
    <tr className="divide-x">
      <td className="bg-gray-50 text-center px-2">{registerName}</td>
      <RegisterValueTableDataCell radixTag="hex">
        <span className={`rounded text-sm px-1 ${valueClassName}`}>{hexValue}</span>
      </RegisterValueTableDataCell>
      <RegisterValueTableDataCell radixTag="bin">
        <span className="rounded text-sm px-1">{binValue}</span>
      </RegisterValueTableDataCell>
      <RegisterValueTableDataCell radixTag="dec">
        <span className="rounded text-sm px-1">{decValue}</span>
      </RegisterValueTableDataCell>
    </tr>
  )
}

export default RegisterTableRow
