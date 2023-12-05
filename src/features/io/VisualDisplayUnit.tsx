import { useEffect } from 'react'
import { first, map, merge, switchMap } from 'rxjs'

import { store } from '@/app/store'
import { subscribe } from '@/app/subscribe'
import { NO_BREAK_SPACE } from '@/common/constants'
import { asciiToChars, chunk } from '@/common/utils'

import { resetMemoryData, selectMemoryData, setMemoryDataFrom } from '../memory/memorySlice'
import DeviceCard from './DeviceCard'
import { useIoDevice } from './hooks'
import { IoDeviceName, setVduDataFrom } from './ioSlice'

const VisualDisplayUnit = (): JSX.Element | null => {
  const { data, isVisible, toggleVisible } = useIoDevice(IoDeviceName.VisualDisplayUnit)

  useEffect(() => {
    // TODO: refactor handling memory changes
    const setMemoryDataFrom$ = store.onAction(setMemoryDataFrom)
    const resetMemoryData$ = store.onAction(resetMemoryData)
    const memoryData$ = store.onState(selectMemoryData)
    return subscribe(
      merge(setMemoryDataFrom$, resetMemoryData$).pipe(
        switchMap(() => memoryData$.pipe(first())),
        map(setVduDataFrom),
      ),
      store.dispatch,
    )
  }, [])

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
