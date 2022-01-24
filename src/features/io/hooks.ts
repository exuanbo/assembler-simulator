import { useEffect } from 'react'
import { useSelector, useLazilyInitializedSelector } from '@/app/hooks'
import { dispatch, listenAction } from '@/app/store'
import {
  NameOfIoDeviceWithData,
  IoDevice,
  selectIoDeviceData,
  createIoDeviceVisibilitySelector,
  setIoDeviceData
} from './ioSlice'

export const useIoDeviceWithData = (deviceName: NameOfIoDeviceWithData): IoDevice => {
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

  return { data, isVisible }
}
