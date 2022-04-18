import { useEffect } from 'react'
import { listenAction } from '@/app/actionListener'
import { useStore, useSelector, useLazilyInitializedSelector } from '@/app/hooks'
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
  const store = useStore()
  const data = useSelector(selectIoDeviceData(deviceName))

  const { isVisible, toggleVisible } = useLazilyInitializedSelector(() =>
    createIoDeviceVisibilitySelector(deviceName)
  )

  useEffect(() => {
    if (!isVisible) {
      return listenAction(setIoDeviceData, ({ name: targetDeviceName }) => {
        if (targetDeviceName === deviceName) {
          store.dispatch(toggleVisible())
        }
      })
    }
  }, [isVisible])

  return { data, isVisible, toggleVisible }
}

export const useVisualDisplayUnit = (): IoDevice => {
  const store = useStore()

  const { data, isVisible, toggleVisible } = useIoDevice(IoDeviceName.VisualDisplayUnit)

  useEffect(() => {
    return listenAction(setMemoryDataFrom, () => {
      const memoryData = selectMemoryData(store.getState())
      const vduData = getVduDataFrom(memoryData)
      const shouldToggleVisible = !isVisible && vduDataChanged(vduData)
      store.dispatch(setVduData(vduData))
      if (shouldToggleVisible) {
        store.dispatch(toggleVisible())
      }
    })
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) {
      return listenAction(setVduDataFrom, () => {
        // vdu buffer must have been changed
        store.dispatch(toggleVisible())
      })
    }
  }, [isVisible])

  return { data, isVisible }
}
