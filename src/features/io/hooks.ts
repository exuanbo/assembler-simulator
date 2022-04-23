import { useEffect, useCallback } from 'react'
import { listenAction } from '@/app/actionListener'
import { useStore, useSelector } from '@/app/hooks'
import {
  IoDeviceName,
  IoDevice,
  selectIoDeviceData,
  selectIoDeviceVisible,
  setVduDataFrom,
  setIoDeviceData,
  toggleIoDeviceVisible
} from './ioSlice'
import { selectMemoryData, setMemoryDataFrom } from '@/features/memory/memorySlice'

export const useIoDevice = (deviceName: IoDeviceName): IoDevice & { toggleVisible: () => void } => {
  const store = useStore()
  const data = useSelector(selectIoDeviceData(deviceName))
  const isVisible = useSelector(selectIoDeviceVisible(deviceName))

  const toggleVisible = useCallback(() => {
    store.dispatch(toggleIoDeviceVisible(deviceName))
  }, [])

  useEffect(() => {
    if (!isVisible) {
      return listenAction(setIoDeviceData, ({ name: targetDeviceName }) => {
        if (targetDeviceName === deviceName) {
          toggleVisible()
        }
      })
    }
  }, [isVisible])

  return { data, isVisible, toggleVisible }
}

export const useVisualDisplayUnit = (): ReturnType<typeof useIoDevice> => {
  const device = useIoDevice(IoDeviceName.VisualDisplayUnit)

  useEffect(() => {
    return listenAction(setMemoryDataFrom, (_, api) => {
      const memoryData = selectMemoryData(api.getState())
      api.dispatch(setVduDataFrom(memoryData))
    })
  }, [])

  return device
}
