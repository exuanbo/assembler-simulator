import { FunctionalComponent, h } from 'preact'
import Card from './card'
import { addressState } from './app'
import { decToHex, splitUint8ArrayPerChunk } from '../utils'

const RAM: FunctionalComponent = () => {
  const [address] = addressState.useState()

  return (
    <Card title="RAM">
      <table className="table is-narrow is-fullwidth">
        <tbody>
          {splitUint8ArrayPerChunk(address, 0x10).map((addrArr, arrIndex) => (
            <tr key={`row-${arrIndex}`}>
              {addrArr.map((addr, addrIndex) => (
                <td key={`row-${arrIndex}-${addrIndex}`}>{decToHex(addr)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        table.table td {
          border: none;
          padding: 0 0.75rem;
          font-family: monospace;
          font-size: 0.875rem;
        }
      `}</style>
    </Card>
  )
}

export default RAM
