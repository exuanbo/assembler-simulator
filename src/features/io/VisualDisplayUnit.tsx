import DeviceCard from './DeviceCard'
import { useVisualDisplayUnit } from './hooks'
import { NO_BREAK_SPACE } from '@/common/constants'
import { asciiToChars, chunk } from '@/common/utils'

const VisualDisplayUnit = (): JSX.Element | null => {
  const { data, isVisible, toggleVisible } = useVisualDisplayUnit()

  return isVisible ? (
    <DeviceCard
      className="flex flex-col space-y-1"
      name="Visual Display Unit"
      onClose={toggleVisible}>
      {chunk(0x10, asciiToChars(data)).map((row, rowIndex) => (
        <div key={rowIndex} className="flex space-x-1">
          {row.map((char, charIndex) => (
            <div key={charIndex} className="bg-gray-200 text-center w-4.5">
              {char === ' ' ? NO_BREAK_SPACE : char}
            </div>
          ))}
        </div>
      ))}
    </DeviceCard>
  ) : null
}

export default VisualDisplayUnit
