import React from 'react'
import Card from './Card'
import { memoryState } from '../atoms'
import { decToHex, splitUint8ArrayPerChunk } from '../core/utils'

interface Props {
  className?: string
}

const Memory = ({ className }: Props): JSX.Element => {
  const [address] = memoryState.useState()
  const addressMatrix = splitUint8ArrayPerChunk(address, 0x10)

  return (
    <Card className={className} title="Memory">
      <table className="w-full font-mono text-sm leading-tight divide-y">
        <thead>
          <tr className="divide-x bg-gray-50">
            <th />
            {addressMatrix[0].map((_, colIndex) => (
              <th key={`col-index-${colIndex}`} className="text-center">
                {decToHex(colIndex)[1]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {addressMatrix.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="divide-x">
              <td className="text-center bg-gray-50">{decToHex(rowIndex)[1]}</td>
              {row.map((addr, addrIndex) => (
                <td key={`row-${rowIndex}-col-${addrIndex}`} className="text-center">
                  {decToHex(addr)}
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
