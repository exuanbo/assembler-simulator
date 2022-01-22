import { useMemo } from 'react'
import DeviceCard from './DeviceCard'
import { useSelector } from '@/app/hooks'
import { selectVduBuffer } from '@/features/memory/memorySlice'
import { IoDeviceName, createIoDeviceViewSelector } from './ioSlice'
import { NO_BREAK_SPACE } from '@/common/constants'
import { asciiToChars, chunk } from '@/common/utils'

const VisualDisplayUnit = (): JSX.Element | null => {
  const selectView = useMemo(() => createIoDeviceViewSelector(IoDeviceName.VisualDisplayUnit), [])
  const { isActive } = useSelector(selectView)

  // TODO: use a getter
  const vduData = useSelector(selectVduBuffer)

  return isActive ? (
    <DeviceCard
      className="flex flex-col space-y-1 items-center justify-center"
      name="Visual Display Unit">
      {chunk(0x10, asciiToChars(vduData)).map((row, rowIndex) => (
        <div key={rowIndex} className="flex space-x-1">
          {row.map((char, charIndex) => (
            <div key={charIndex} className="bg-gray-200 px-1">
              {char === ' ' ? NO_BREAK_SPACE : char}
            </div>
          ))}
        </div>
      ))}
    </DeviceCard>
  ) : null
}

export default VisualDisplayUnit
