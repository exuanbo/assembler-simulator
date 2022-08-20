import { useEffect, useCallback } from 'react'
import { listenAction } from '@/app/actionListener'
import { Unsubscribe, watch } from '@/app/watcher'
import { useStore, useSelector } from '@/app/hooks'
import {
  IoDeviceName,
  IoDeviceState,
  selectIoDeviceData,
  selectIoDeviceVisible,
  setVduDataFrom,
  setIoDeviceData,
  toggleIoDeviceVisible
} from './ioSlice'
import { selectMemoryData, setMemoryDataFrom } from '@/features/memory/memorySlice'

interface IoDeviceActions {
  subscribeData: (callback: (data: number[]) => void) => Unsubscribe
  toggleVisible: () => void
}

interface IoDevice extends IoDeviceState, IoDeviceActions {}

export const useIoDevice = (deviceName: IoDeviceName): IoDevice => {
  const store = useStore()

  const data = useSelector(selectIoDeviceData(deviceName))

  const subscribeData = useCallback(
    (listener: (data: number[]) => void) => watch(selectIoDeviceData(deviceName), listener),
    [deviceName]
  )

  const isVisible = useSelector(selectIoDeviceVisible(deviceName))

  const toggleVisible = useCallback(() => {
    store.dispatch(toggleIoDeviceVisible(deviceName))
  }, [deviceName])

  useEffect(() => {
    if (!isVisible) {
      return listenAction(setIoDeviceData, ({ name: targetDeviceName }) => {
        if (targetDeviceName === deviceName) {
          toggleVisible()
        }
      })
    }
  }, [isVisible, deviceName])

  return { data, subscribeData, isVisible, toggleVisible }
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
