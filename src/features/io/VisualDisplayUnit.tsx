import DeviceCard from './DeviceCard'
import { useSelector } from '@/app/hooks'
import { selectVduBuffer } from '@/features/memory/memorySlice'
import { NO_BREAK_SPACE } from '@/common/constants'
import { asciiToChars, chunk } from '@/common/utils'

const VisualDisplayUnit = (): JSX.Element => {
  const vduData = useSelector(selectVduBuffer)
  const chars = asciiToChars(vduData)

  return (
    <DeviceCard
      className="flex flex-col space-y-1 items-center justify-center"
      name="Visual Display Unit">
      {chunk(0x10, chars).map((line, lineIndex) => (
        <div key={lineIndex} className="flex space-x-1">
          {line.map((char, charIndex) => (
            <div key={charIndex} className="bg-gray-200 px-1">
              {char === ' ' ? NO_BREAK_SPACE : char}
            </div>
          ))}
        </div>
      ))}
    </DeviceCard>
  )
}

export default VisualDisplayUnit
