import { useEffect } from 'react'
import { useSelector, useLazilyInitializedSelector } from '@/app/hooks'
import { dispatch, listenAction } from '@/app/store'
import {
  IoDeviceName,
  IoDevice,
  selectIoDeviceData,
  IoDeviceVisibility,
  createIoDeviceVisibilitySelector,
  setVduDataFrom,
  setIoDeviceData
} from './ioSlice'
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
    if (!isVisible) {
      return listenAction(setVduDataFrom, (_, { getState }) => {
        const vduData = selectIoDeviceData(IoDeviceName.VisualDisplayUnit)(getState())
        if (vduData.some(value => value !== SPACE_ASCII)) {
          dispatch(toggleVisible())
        }
      })
    }
  }, [isVisible])

  useEffect(() => {
    return listenAction(setMemoryDataFrom, (_, { getState }) => {
      const memoryData = selectMemoryData(getState())
      dispatch(setVduDataFrom(memoryData))
    })
  }, [])

  return { data, isVisible }
}
