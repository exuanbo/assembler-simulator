import React from 'react'
import Card from '../../common/components/Card'
import { useSelector, useShallowEqualSelector } from '../../app/hooks'
import { selectMemoryDataRows, selectMemorySourceRows } from './memorySlice'
import { selectCpuPointerRegisters } from '../cpu/cpuSlice'
import { MemoryView, selectMemoryView } from '../controller/controllerSlice'
import { MAX_SP } from '../../common/constants'
import { decToHex } from '../../common/utils'

interface Props {
  className?: string
}

const Memory = ({ className }: Props): JSX.Element => {
  const memoryView = useSelector(selectMemoryView)

  const dataRows = useSelector(selectMemoryDataRows)
  const sourceRows = useSelector(selectMemorySourceRows)
  const rows = memoryView === MemoryView.Source ? sourceRows : dataRows

  let address = 0
  const { ip, sp } = useShallowEqualSelector(selectCpuPointerRegisters)

  return (
    <Card className={className} title="Memory">
      <table className="text-sm w-full">
        <tbody className="divide-y">
          <tr className="divide-x bg-gray-50 text-gray-400">
            <td />
            {rows[0].map((_, colIndex) => (
              <td key={colIndex} className="text-center">
                {decToHex(colIndex)[1]}
              </td>
            ))}
          </tr>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="divide-x">
              <td className="bg-gray-50 text-center text-gray-400">
                <span className="px-1">{decToHex(rowIndex)[1]}</span>
              </td>
              {row.map((value, colIndex) => {
                const spanClassName =
                  address === ip
                    ? 'rounded bg-green-100'
                    : address === sp
                    ? 'rounded bg-blue-100'
                    : sp < address && address <= MAX_SP
                    ? 'rounded bg-blue-50'
                    : ''
                address += 1
                return (
                  <td key={colIndex} className="text-center">
                    <span className={`px-1 ${spanClassName}`}>
                      {memoryView === MemoryView.Hexadecimal ? decToHex(value as number) : value}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default Memory
