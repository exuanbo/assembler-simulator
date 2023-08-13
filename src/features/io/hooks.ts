import { useEffect, useCallback, useMemo } from 'react'
import { filter } from 'rxjs'
import { Unsubscribe, subscribe } from '@/app/subscribe'
import { store, applySelector } from '@/app/store'
import { useSelector } from '@/app/hooks'
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
  const selectData = useMemo(() => selectIoDeviceData(deviceName), [deviceName])
  const data = useSelector(selectData)

  type DataListener = (data: number[]) => void
  const subscribeData = useCallback(
    (listener: DataListener) => {
      return subscribe(store.onState(selectData), listener)
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
      return subscribe(
        store
          .onAction(setIoDeviceData)
          .pipe(filter(({ name: targetDeviceName }) => targetDeviceName === deviceName)),
        toggleVisible
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
