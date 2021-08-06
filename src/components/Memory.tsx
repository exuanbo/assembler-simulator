import React from 'react'
import Card from './Card'
import { memoryState } from '../atoms'
import { decToHex, splitArrayPerChunk } from '../core/utils'

interface Props {
  className?: string
}

const Memory = ({ className }: Props): JSX.Element => {
  const [memory] = memoryState.useState()
  const machineCodesMatrix = splitArrayPerChunk(memory, 0x10)

  return (
    <Card className={className} title="Memory">
      <table className="w-full font-mono text-sm leading-tight divide-y">
        <thead>
          <tr className="divide-x bg-gray-50">
            <th />
            {machineCodesMatrix[0].map((_, colIndex) => (
              <th key={`col-${colIndex}`} className="text-center">
                {decToHex(colIndex)[1]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {machineCodesMatrix.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="divide-x">
              <td className="text-center bg-gray-50">{decToHex(rowIndex)[1]}</td>
              {row.map((machineCode, colIndex) => (
                <td key={`row-${rowIndex}-col-${colIndex}`} className="text-center">
                  {decToHex(machineCode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default Memory
