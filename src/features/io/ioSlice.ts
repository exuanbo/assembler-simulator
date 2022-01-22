import { PayloadAction, createSlice, createSelector } from '@reduxjs/toolkit'
import { InputSignals, InputPort, initialInputSignals } from './core'
import type { RootState } from '@/app/store'
import { decTo8bitBinDigits, curry2rev } from '@/common/utils'

export enum IoDeviceName {
  VisualDisplayUnit = 'Visual Display Unit',
  TrafficLights = 'Traffic Lights',
  SevenSegmentDisplay = 'Seven Segment Display'
}

const ioDeviceNames: readonly IoDeviceName[] = Object.values(IoDeviceName)

interface IoDevice {
  isActive: boolean
  data: number
}

type IoDevices = {
  [name in Exclude<IoDeviceName, IoDeviceName.VisualDisplayUnit>]: IoDevice
} & {
  [IoDeviceName.VisualDisplayUnit]: Omit<IoDevice, 'data'>
}

interface IoState {
  inputSignals: InputSignals
  isWaitingForInput: boolean
  isWaitingForKeyboardInput: boolean
  devices: IoDevices
}

const initialState: IoState = {
  inputSignals: initialInputSignals,
  isWaitingForInput: false,
  isWaitingForKeyboardInput: false,
  devices: {
    [IoDeviceName.VisualDisplayUnit]: {
      isActive: true
    },
    [IoDeviceName.TrafficLights]: {
      isActive: false,
      data: 0
    },
    [IoDeviceName.SevenSegmentDisplay]: {
      isActive: false,
      data: 0
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
    setWaitingForKeyboardInput: (state, action: PayloadAction<boolean>): void => {
      state.isWaitingForKeyboardInput = action.payload
    },
    toggleDevice: (state: IoState, action: PayloadAction<IoDeviceName>): void => {
      const name = action.payload
      state.devices[name].isActive = !state.devices[name].isActive
    },
    setDeviceData: (
      state: IoState,
      action: PayloadAction<{
        name: Exclude<IoDeviceName, IoDeviceName.VisualDisplayUnit>
        data: number
      }>
    ): void => {
      const { name, data } = action.payload
      state.devices[name].data = data
    },
    reset: () => initialState
  }
})

export const selectInputSignals = (state: RootState): InputSignals => state.io.inputSignals

export const selectIsWaitingForInput = (state: RootState): boolean => state.io.isWaitingForInput

export const selectIsWaitingForKeyboardInput = (state: RootState): boolean =>
  state.io.isWaitingForKeyboardInput

const selectIoDevices = (state: RootState): IoDevices => state.io.devices

interface IoDeviceView {
  isActive: boolean
  toggleActive: () => ReturnType<typeof toggleIoDevice>
}

const getIoDeviceView = (name: IoDeviceName, devices: IoDevices): IoDeviceView => ({
  isActive: devices[name].isActive,
  toggleActive: () => toggleIoDevice(name)
})

export const selectIoDeviceView = curry2rev(
  createSelector(
    [selectIoDevices, (_, name: IoDeviceName) => name],
    (devices, name) => getIoDeviceView(name, devices),
    {
      memoizeOptions: {
        resultEqualityCheck: (prev, curr) => prev.isActive === curr.isActive,
        maxSize: ioDeviceNames.length
      }
    }
  )
)

export const selectIoDeviceViewOptions = createSelector(selectIoDevices, devices =>
  ioDeviceNames.map(name => ({
    name,
    ...getIoDeviceView(name as IoDeviceName, devices)
  }))
)

// TODO: extract more generic selector

const selectTrafficLightsData = (state: RootState): number =>
  state.io.devices[IoDeviceName.TrafficLights].data

export const selectTrafficLightsDataDigits = createSelector(
  selectTrafficLightsData,
  decTo8bitBinDigits
)

const selectSevenSegmentDisplayData = (state: RootState): number =>
  state.io.devices[IoDeviceName.SevenSegmentDisplay].data

export const selectSevenSegmentDisplayDataDigits = createSelector(
  selectSevenSegmentDisplayData,
  decTo8bitBinDigits
)

export const {
  setInputData,
  clearInputData,
  setInterrupt,
  setWaitingForInput,
  setWaitingForKeyboardInput,
  toggleDevice: toggleIoDevice,
  setDeviceData: setIoDeviceData,
  reset: resetIo
} = ioSlice.actions

export default ioSlice.reducer
