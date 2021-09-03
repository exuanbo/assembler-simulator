import React from 'react'
import Card from '../../common/components/Card'
import { useAppSelector, useAppShallowEqualSelector } from '../../app/hooks'
import { selectMemoryData } from './memorySlice'
import { selectCpuPointerRegisters } from '../cpu/cpuSlice'
import { decToHex, splitArrayPerChunk } from '../../common/utils'

interface Props {
  className?: string
}

const Memory = ({ className }: Props): JSX.Element => {
  const memoryData = useAppSelector(selectMemoryData)
  const machineCodesMatrix = splitArrayPerChunk(memoryData, 0x10)

  let address = 0
  const { ip, sp } = useAppShallowEqualSelector(selectCpuPointerRegisters)

  return (
    <Card className={className} title="Memory">
      <table className="divide-y text-sm w-full">
        <tbody className="divide-y">
          <tr className="divide-x bg-gray-50">
            <td />
            {machineCodesMatrix[0].map((_, colIndex) => (
              <td key={colIndex} className="text-center">
                {decToHex(colIndex)[1]}
              </td>
            ))}
          </tr>
          {machineCodesMatrix.map((row, rowIndex) => (
            <tr key={rowIndex} className="divide-x">
              <td className="bg-gray-50 text-center">{decToHex(rowIndex)[1]}</td>
              {row.map((machineCode, colIndex) => {
                const bgColorClassName =
                  address === ip ? 'bg-green-100' : address === sp ? 'bg-blue-100' : ''
                address += 1
                return (
                  <td key={colIndex} className="text-center">
                    <span className={`rounded px-1 ${bgColorClassName}`}>
                      {decToHex(machineCode)}
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
