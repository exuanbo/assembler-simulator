import React from 'react'
import Card from '../../common/components/Card'
import { useShallowEqualSelector } from '../../app/hooks'
import { selectVduBuffer } from './selectors'
import { NO_BREAK_SPACE } from '../../common/constants'
import { asciiToChars, splitArrayPerChunk } from '../../common/utils'

const VisualDisplayUnit = (): JSX.Element => {
  const vduData = useShallowEqualSelector(selectVduBuffer)
  const chars = asciiToChars(vduData)

  return (
    <Card className="border-b border-r max-w-max" title="VDU">
      <div className="flex flex-col space-y-1 p-1 resize overflow-auto items-center justify-center">
        {splitArrayPerChunk(chars, 0x10).map((line, lineIndex) => (
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
