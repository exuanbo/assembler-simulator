import { PayloadAction, createSlice, createSelector } from '@reduxjs/toolkit'
import { InputSignals, InputPort, initialInputSignals } from './core'
import type { RootState } from '@/app/store'
import { decTo8bitBinDigits } from '@/common/utils'

export enum IoDeviceName {
  VisualDisplayUnit = 'Visual Display Unit',
  TrafficLights = 'Traffic Lights',
  SevenSegmentDisplay = 'Seven Segment Display'
}

export const ioDeviceNames: readonly IoDeviceName[] = Object.values(IoDeviceName)

type IoDeviceWithData = Exclude<IoDeviceName, IoDeviceName.VisualDisplayUnit>

interface IoDevice {
  /**
   * 8-bit binary digits
   */
  data: number[]
  isVisible: boolean
}

type IoDevices = {
  [name in IoDeviceWithData]: IoDevice
} & {
  [IoDeviceName.VisualDisplayUnit]: Omit<IoDevice, 'data'>
}

interface IoState {
  inputSignals: InputSignals
  isWaitingForInput: boolean
  isWaitingForKeyboardInput: boolean
  devices: IoDevices
}

const initialData = new Array(8).fill(0)

const initialState: IoState = {
  inputSignals: initialInputSignals,
  isWaitingForInput: false,
  isWaitingForKeyboardInput: false,
  devices: {
    [IoDeviceName.VisualDisplayUnit]: {
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
    setWaitingForKeyboardInput: (state, action: PayloadAction<boolean>): void => {
      state.isWaitingForKeyboardInput = action.payload
    },
    setDeviceData: (
      state,
      action: PayloadAction<{ name: IoDeviceWithData; data: number }>
    ): void => {
      const { name, data } = action.payload
      state.devices[name].data = decTo8bitBinDigits(data)
    },
    toggleDeviceVisible: (state: IoState, action: PayloadAction<IoDeviceName>): void => {
      const name = action.payload
      state.devices[name].isVisible = !state.devices[name].isVisible
    },
    reset: () => initialState
  }
})

export const selectInputSignals = (state: RootState): InputSignals => state.io.inputSignals

export const selectIsWaitingForInput = (state: RootState): boolean => state.io.isWaitingForInput

export const selectIsWaitingForKeyboardInput = (state: RootState): boolean =>
  state.io.isWaitingForKeyboardInput

export const selectIoDevices = (state: RootState): IoDevices => state.io.devices

export const selectIoDeviceData =
  (name: IoDeviceWithData) =>
  (state: RootState): number[] =>
    state.io.devices[name].data

type ToggleVisible = () => ReturnType<typeof toggleIoDeviceVisible>

interface IoDeviceVisibility {
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
  setDeviceData: setIoDeviceData,
  toggleDeviceVisible: toggleIoDeviceVisible,
  reset: resetIo
} = ioSlice.actions

export default ioSlice.reducer
