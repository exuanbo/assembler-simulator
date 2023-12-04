import { useCallback, useEffect, useMemo } from 'react'
import { filter } from 'rxjs'

import { applySelector, useSelector } from '@/app/selector'
import { store } from '@/app/store'
import { subscribe, type Unsubscribe } from '@/app/subscribe'
import { curryRight2 } from '@/common/utils'
import { selectMemoryData, setMemoryDataFrom } from '@/features/memory/memorySlice'

import {
  type IoDeviceData,
  IoDeviceName,
  type IoDeviceState,
  selectIoDeviceData,
  selectIoDeviceVisibility,
  setIoDeviceData,
  setVduDataFrom,
  toggleIoDeviceVisible,
} from './ioSlice'

type DataCallback = (data: IoDeviceData) => void

interface IoDeviceActions {
  subscribeData: (callback: DataCallback) => Unsubscribe
  toggleVisible: () => void
}

interface IoDevice extends IoDeviceState, IoDeviceActions {}

export const useIoDevice = (deviceName: IoDeviceName): IoDevice => {
  const selectData = useMemo(() => curryRight2(selectIoDeviceData)(deviceName), [deviceName])
  const data = useSelector(selectData)

  const subscribeData = useCallback(
    (listener: DataCallback) => {
      return subscribe(store.onState(selectData), listener)
    },
    [selectData],
  )

  const isVisible = useSelector(
    useMemo(() => curryRight2(selectIoDeviceVisibility)(deviceName), [deviceName]),
  )

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
  }, [deviceName, isVisible, toggleVisible])

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
