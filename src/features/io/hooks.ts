import { useCallback, useEffect, useMemo } from 'react'
import { filter } from 'rxjs'

import { applySelector, useSelector } from '@/app/selector'
import { store } from '@/app/store'
import { subscribe, Unsubscribe } from '@/app/subscribe'
import { selectMemoryData, setMemoryDataFrom } from '@/features/memory/memorySlice'

import {
  IoDeviceName,
  IoDeviceState,
  selectIoDeviceData,
  selectIoDeviceVisibility,
  setIoDeviceData,
  setVduDataFrom,
  toggleIoDeviceVisible,
} from './ioSlice'

interface IoDeviceActions {
  subscribeData: (callback: (data: number[]) => void) => Unsubscribe
  toggleVisible: () => void
}

interface IoDevice extends IoDeviceState, IoDeviceActions {}

export const useIoDevice = (deviceName: IoDeviceName): IoDevice => {
  const selectData = useMemo(() => selectIoDeviceData(deviceName), [deviceName])
  const data = useSelector(selectData)

  type DataListener = (data: number[]) => void
  const subscribeData = useCallback(
    (listener: DataListener) => {
      return subscribe(store.onState(selectData), listener)
    },
    [deviceName],
  )

  const selectVisibility = useMemo(() => selectIoDeviceVisibility(deviceName), [deviceName])
  const isVisible = useSelector(selectVisibility)

  const toggleVisible = useCallback(() => {
    store.dispatch(toggleIoDeviceVisible(deviceName))
  }, [deviceName])

  useEffect(() => {
    if (!isVisible) {
      return subscribe(
        store
          .onAction(setIoDeviceData)
          .pipe(filter(({ name: targetDeviceName }) => targetDeviceName === deviceName)),
        toggleVisible,
      )
    }
  }, [isVisible, deviceName])

  return { data, subscribeData, isVisible, toggleVisible }
}

export const useVisualDisplayUnit = (): ReturnType<typeof useIoDevice> => {
  const device = useIoDevice(IoDeviceName.VisualDisplayUnit)

  useEffect(() => {
    return subscribe(store.onAction(setMemoryDataFrom), () => {
      const memoryData = applySelector(selectMemoryData)
      store.dispatch(setVduDataFrom(memoryData))
    })
  }, [])

  return device
}
