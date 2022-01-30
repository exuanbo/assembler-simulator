import { useEffect } from 'react'
// TODO: remove batch from React 18
import { batch } from 'react-redux'
import { useSelector, useLazilyInitializedSelector } from '@/app/hooks'
import { dispatch, listenAction } from '@/app/store'
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
import { getVduDataFrom } from '@/features/memory/core'
import { selectMemoryData, setMemoryDataFrom } from '@/features/memory/memorySlice'
import { SPACE_ASCII } from '@/common/constants'

export const useIoDevice = (deviceName: IoDeviceName): IoDevice & IoDeviceVisibility => {
  const data = useSelector(selectIoDeviceData(deviceName))

  const { isVisible, toggleVisible } = useLazilyInitializedSelector(() =>
    createIoDeviceVisibilitySelector(deviceName)
  )

  useEffect(() => {
    if (!isVisible) {
      return listenAction(setIoDeviceData, ({ name: targetDeviceName }) => {
        if (targetDeviceName === deviceName) {
          dispatch(toggleVisible())
        }
      })
    }
  }, [isVisible])

  return { data, isVisible, toggleVisible }
}

export const useVisualDisplayUnit = (): IoDevice => {
  const { data, isVisible, toggleVisible } = useIoDevice(IoDeviceName.VisualDisplayUnit)

  useEffect(() => {
    return listenAction(setMemoryDataFrom, (_, { getState }) => {
      const memoryData = selectMemoryData(getState())
      const vduData = getVduDataFrom(memoryData)
      // TODO: extract function
      const shouldToggleVisible = !isVisible && vduData.some(value => value !== SPACE_ASCII)
      batch(() => {
        dispatch(setVduData(vduData))
        if (shouldToggleVisible) {
          dispatch(toggleVisible())
        }
      })
    })
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) {
      return listenAction(setVduDataFrom, () => {
        // vdu buffer must have been changed
        dispatch(toggleVisible())
      })
    }
  }, [isVisible])

  return { data, isVisible }
}
