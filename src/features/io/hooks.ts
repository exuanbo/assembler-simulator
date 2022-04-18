import { useEffect } from 'react'
import { listenAction } from '@/app/actionListener'
import { useSelector, useLazilyInitializedSelector } from '@/app/hooks'
import {
  IoDeviceName,
  IoDevice,
  selectIoDeviceData,
  IoDeviceVisibility,
  createIoDeviceVisibilitySelector,
  setVduData,
  setVduDataFrom,
  setIoDeviceData
} from './ioSlice'
import { getVduDataFrom, vduDataChanged } from '@/features/memory/core'
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

export const useVisualDisplayUnit = (): IoDevice => {
  const { data, isVisible, toggleVisible } = useIoDevice(IoDeviceName.VisualDisplayUnit)

  useEffect(() => {
    return listenAction(setMemoryDataFrom, (_, api) => {
      const memoryData = selectMemoryData(api.getState())
      const vduData = getVduDataFrom(memoryData)
      const shouldToggleVisible = !isVisible && vduDataChanged(vduData)
      api.dispatch(setVduData(vduData))
      if (shouldToggleVisible) {
        api.dispatch(toggleVisible())
      }
    })
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) {
      return listenAction(setVduDataFrom, (_, api) => {
        // vdu buffer must have been changed
        api.dispatch(toggleVisible())
      })
    }
  }, [isVisible])

  return { data, isVisible }
}
