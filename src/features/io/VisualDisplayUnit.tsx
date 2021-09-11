import React from 'react'
import Card from '../../common/components/Card'
import { useAppShallowEqualSelector } from '../../app/hooks'
import { selectMemoryData } from '../memory/memorySlice'
import { NO_BREAK_SPACE } from '../../common/constants'
import { asciiToChars } from '../../common/utils'

const VisualDisplayUnit = (): JSX.Element => {
  const vduData = useAppShallowEqualSelector(state => selectMemoryData(state).slice(0xc0))
  const chars = asciiToChars(vduData)

  return (
    <Card className="border-b border-r max-w-max" title="VDU">
      <div className="flex flex-wrap space-x-1 space-y-1 h-124px pr-1 pb-1 w-354px items-center resize overflow-auto">
        {chars.map((char, index) => (
          <div key={index} className="bg-gray-200 px-1 first:(ml-1 mt-1) ">
            {char === ' ' ? NO_BREAK_SPACE : char}
          </div>
        ))}
      </div>
    </Card>
  )
}

export default VisualDisplayUnit
