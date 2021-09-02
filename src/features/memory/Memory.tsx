import React from 'react'
import { shallowEqual } from 'react-redux'
import Card from '../../common/components/Card'
import { useAppSelector } from '../../app/hooks'
import { selectMemoryData } from './memorySlice'
import { selectIPnSP } from '../cpu/cpuSlice'
import { decToHex, splitArrayPerChunk } from '../../common/utils'

interface Props {
  className?: string
}

const Memory = ({ className }: Props): JSX.Element => {
  const memory = useAppSelector(selectMemoryData)
  const machineCodesMatrix = splitArrayPerChunk(memory, 0x10)

  let address = 0
  const { ip, sp } = useAppSelector(selectIPnSP, shallowEqual)

  return (
    <Card className={className} title="Memory">
      <table className="w-full font-mono text-sm divide-y">
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
              <td className="text-center bg-gray-50">{decToHex(rowIndex)[1]}</td>
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
