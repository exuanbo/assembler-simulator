import Card from '../../common/components/Card'
import { useSelector } from '../../app/hooks'
import { selectVduBuffer } from '../memory/memorySlice'
import { NO_BREAK_SPACE } from '../../common/constants'
import { asciiToChars, chunk } from '../../common/utils'

const VisualDisplayUnit = (): JSX.Element => {
  const vduData = useSelector(selectVduBuffer)
  const chars = asciiToChars(vduData)

  return (
    <Card className="border-b border-r max-w-max" title="VDU">
      <div className="flex flex-col space-y-1 p-1 resize overflow-auto items-center justify-center">
        {chunk(0x10, chars).map((line, lineIndex) => (
          <div key={lineIndex} className="flex space-x-1">
            {line.map((char, charIndex) => (
              <div key={charIndex} className="bg-gray-200 px-1">
                {char === ' ' ? NO_BREAK_SPACE : char}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  )
}

export default VisualDisplayUnit
