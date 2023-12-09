import { useCallback, useEffect, useMemo } from 'react'
import { filter } from 'rxjs'

import { store, useSelector } from '@/app/store'
import { observe, type Unsubscribe } from '@/common/observe'
import { curryRight2 } from '@/common/utils'

import {
  type IoDeviceData,
  type IoDeviceName,
  type IoDeviceState,
  selectIoDeviceData,
  selectIoDeviceVisibility,
  setIoDeviceData,
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
      const data$ = store.onState(selectData)
      return observe(data$, listener)
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
    if (isVisible) {
      return
    }
    const setIoDeviceData$ = store.onAction(setIoDeviceData)
    return observe(setIoDeviceData$.pipe(filter(({ name }) => name === deviceName)), toggleVisible)
  }, [deviceName, isVisible, toggleVisible])

  return { data, subscribeData, isVisible, toggleVisible }
}
