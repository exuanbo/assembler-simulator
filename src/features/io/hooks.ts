import { useEffect, useCallback, useMemo } from 'react'
import { listenAction } from '@/app/actionListener'
import { Unsubscribe, watch } from '@/app/watcher'
import { useStore, useSelector } from '@/app/hooks'
import {
  IoDeviceName,
  IoDeviceState,
  selectIoDeviceData,
  selectIoDeviceVisibility,
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

  const selectData = useMemo(() => selectIoDeviceData(deviceName), [deviceName])
  const data = useSelector(selectData)

  type DataListener = (data: number[]) => void
  const subscribeData = useCallback(
    (listener: DataListener) => {
      return watch(selectData, listener)
    },
    [deviceName]
  )

  const selectVisibility = useMemo(() => selectIoDeviceVisibility(deviceName), [deviceName])
  const isVisible = useSelector(selectVisibility)

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
