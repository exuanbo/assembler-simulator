import CardHeader from '@/common/components/CardHeader'
import { ArrowUp, ArrowDown } from '@/common/components/icons'
import { useSelector } from '@/app/hooks'
import {
  MemoryView,
  selectMemoryDataRowsGetter,
  selectMemorySourceRowsGetter,
  selectMemoryView
} from './memorySlice'
import { MAX_SP } from '@/features/cpu/core'
import { selectCpuPointerRegisters } from '@/features/cpu/cpuSlice'
import { useToggle } from '@/common/hooks'
import { decToHex, range, classNames } from '@/common/utils'

const Memory = (): JSX.Element => {
  const [isOpen, toggleOpen] = useToggle(true)
  const Icon = isOpen ? ArrowUp : ArrowDown

  const memoryView = useSelector(selectMemoryView)
  const isDataView = memoryView !== MemoryView.Source

  const getDataRows = useSelector(selectMemoryDataRowsGetter)
  const getSourceRows = useSelector(selectMemorySourceRowsGetter)

  const rows = isDataView ? getDataRows() : getSourceRows()

  const { ip, sp } = useSelector(selectCpuPointerRegisters)

  return (
    <div className={classNames({ 'border-b': isOpen })}>
      <CardHeader title="Memory" onClick={toggleOpen}>
        <span className="w-4">
          <Icon className="mx-auto fill-gray-400" width="0.625rem" />
        </span>
      </CardHeader>
      {isOpen && (
        <table className="text-sm w-full">
          <tbody className="divide-y">
            <tr className="divide-x bg-gray-50 text-gray-400">
              <td />
              {range(0x10).map(colIndex => (
                <td key={colIndex} className="text-center">
                  <span className="px-1">{decToHex(colIndex)[1] /* ignore padded 0 */}</span>
                </td>
              ))}
            </tr>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="divide-x">
                <td className="bg-gray-50 text-center text-gray-400">
                  <span className="px-1">{decToHex(rowIndex)[1] /* ignore padded 0 */}</span>
                </td>
                {row.map((value, colIndex) => {
                  const address = rowIndex * 0x10 + colIndex
                  return (
                    <td
                      key={colIndex}
                      className={classNames('text-center', {
                        'bg-blue-50': sp < address && address <= MAX_SP && isDataView
                      })}>
                      <span
                        className={classNames('px-1', {
                          'rounded bg-green-100': address === ip,
                          'rounded bg-blue-100': address === sp && isDataView
                        })}>
                        {memoryView === MemoryView.Hexadecimal ? decToHex(value as number) : value}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Memory
