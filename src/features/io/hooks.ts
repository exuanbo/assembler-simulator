import { useEffect } from 'react'
import { listenAction } from '@/app/actionListener'
import { useSelector, useLazilyInitializedSelector } from '@/app/hooks'
import {
  IoDeviceName,
  IoDevice,
  selectIoDeviceData,
  IoDeviceVisibility,
  createIoDeviceVisibilitySelector,
  setVduDataFrom,
  setIoDeviceData
} from './ioSlice'
import { selectMemoryData, setMemoryDataFrom } from '@/features/memory/memorySlice'

export const useIoDevice = (deviceName: IoDeviceName): IoDevice & IoDeviceVisibility => {
  const data = useSelector(selectIoDeviceData(deviceName))

  const { isVisible, toggleVisible } = useLazilyInitializedSelector(() =>
    createIoDeviceVisibilitySelector(deviceName)
  )

  useEffect(() => {
    if (!isVisible) {
      return listenAction(setIoDeviceData, ({ name: targetDeviceName }, api) => {
        if (targetDeviceName === deviceName) {
          api.dispatch(toggleVisible())
        }
      })
    }
  }, [isVisible])

  return { data, isVisible, toggleVisible }
}

export const useVisualDisplayUnit = (): ReturnType<typeof useIoDevice> => {
  const data = useSelector(selectIoDeviceData(IoDeviceName.VisualDisplayUnit))

  const { isVisible, toggleVisible } = useLazilyInitializedSelector(() =>
    createIoDeviceVisibilitySelector(IoDeviceName.VisualDisplayUnit)
  )

  useEffect(() => {
    return listenAction(setMemoryDataFrom, (_, api) => {
      const memoryData = selectMemoryData(api.getState())
      api.dispatch(setVduDataFrom(memoryData))
    })
  }, [])

  return { data, isVisible, toggleVisible }
}
