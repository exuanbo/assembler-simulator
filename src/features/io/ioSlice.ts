import { PayloadAction, createSlice, createSelector } from '@reduxjs/toolkit'
import { merge } from 'merge-anything'
import { InputSignals, InputPort, initialInputSignals } from './core'
import { MemoryData, initVduData, getVduDataFrom } from '@/features/memory/core'
import type { RootState } from '@/app/store'
import { decTo8bitBinDigits } from '@/common/utils'

export enum IoDeviceName {
  VisualDisplayUnit = 'VisualDisplayUnit',
  TrafficLights = 'TrafficLights',
  SevenSegmentDisplay = 'SevenSegmentDisplay'
}

export const ioDeviceNames: readonly IoDeviceName[] = Object.values(IoDeviceName)

export interface IoDevice {
  data: number[]
  isVisible: boolean
}

type IoDevices = {
  [name in IoDeviceName]: IoDevice
}

interface IoState {
  inputSignals: InputSignals
  isWaitingForInput: boolean
  isWaitingForKeyboardInput: boolean
  devices: IoDevices
}

const initialVduData = initVduData()

const initialData = new Array<number>(8).fill(0)

const initialState: IoState = {
  inputSignals: initialInputSignals,
  isWaitingForInput: false,
  isWaitingForKeyboardInput: false,
  devices: {
    [IoDeviceName.VisualDisplayUnit]: {
      data: initialVduData,
      isVisible: true
    },
    [IoDeviceName.TrafficLights]: {
      data: initialData,
      isVisible: false
    },
    [IoDeviceName.SevenSegmentDisplay]: {
      data: initialData,
      isVisible: false
    }
  }
}

export const ioSlice = createSlice({
  name: 'io',
  initialState,
  reducers: {
    setInputData: (state, action: PayloadAction<{ content: number; port: InputPort }>) => {
      const { content, port } = action.payload
      state.inputSignals.data.content = content
      state.inputSignals.data.port = port
    },
    clearInputData: state => {
      state.inputSignals.data.content = null
      state.inputSignals.data.port = null
    },
    setInterrupt: (state, action: PayloadAction<boolean>) => {
      state.inputSignals.interrupt = action.payload
    },
    setWaitingForInput: (state, action: PayloadAction<boolean>) => {
      state.isWaitingForInput = action.payload
    },
    setWaitingForKeyboardInput: (state, action: PayloadAction<boolean>) => {
      state.isWaitingForKeyboardInput = action.payload
    },
    setVduData: (state, action: PayloadAction<number[]>) => {
      state.devices[IoDeviceName.VisualDisplayUnit].data = action.payload
    },
    setVduDataFrom: (state, action: PayloadAction<MemoryData>) => {
      const memoryData = action.payload
      state.devices[IoDeviceName.VisualDisplayUnit].data = getVduDataFrom(memoryData)
    },
    setDeviceData: (state, action: PayloadAction<{ name: IoDeviceName; data: number }>) => {
      const { name, data } = action.payload
      state.devices[name].data = decTo8bitBinDigits(data)
    },
    toggleDeviceVisible: (state, action: PayloadAction<IoDeviceName>) => {
      const name = action.payload
      state.devices[name].isVisible = !state.devices[name].isVisible
    },
    setDevicesInvisible: state => {
      for (const name of ioDeviceNames) {
        state.devices[name].isVisible = false
      }
    },
    reset: state =>
      merge(initialState, {
        devices: Object.entries(state.devices).reduce<Record<string, Pick<IoDevice, 'isVisible'>>>(
          (result, [name, { isVisible }]) => ({
            ...result,
            [name]: { isVisible }
          }),
          {}
        )
      })
  }
})

export const selectInputSignals = (state: RootState): InputSignals => state.io.inputSignals

export const selectIsWaitingForInput = (state: RootState): boolean => state.io.isWaitingForInput

export const selectIsWaitingForKeyboardInput = (state: RootState): boolean =>
  state.io.isWaitingForKeyboardInput

export const selectIoDevices = (state: RootState): IoDevices => state.io.devices

export const selectIoDeviceData =
  (name: IoDeviceName) =>
  (state: RootState): number[] =>
    state.io.devices[name].data

type ToggleVisible = () => ReturnType<typeof toggleIoDeviceVisible>

export interface IoDeviceVisibility {
  isVisible: boolean
  toggleVisible: ToggleVisible
}

type IoDeviceVisibilitySelector = (state: RootState) => IoDeviceVisibility

export const createIoDeviceVisibilitySelector = (
  name: IoDeviceName
): IoDeviceVisibilitySelector => {
  const toggleVisible: ToggleVisible = () => toggleIoDeviceVisible(name)

  return createSelector(
    (state: RootState) => state.io.devices[name].isVisible,
    isVisible => ({ isVisible, toggleVisible })
  )
}

export const {
  setInputData,
  clearInputData,
  setInterrupt,
  setWaitingForInput,
  setWaitingForKeyboardInput,
  setVduData,
  setVduDataFrom,
  setDeviceData: setIoDeviceData,
  toggleDeviceVisible: toggleIoDeviceVisible,
  setDevicesInvisible: setIoDevicesInvisible,
  reset: resetIo
} = ioSlice.actions

export default ioSlice.reducer
