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
  isActive: boolean
  /**
   * 8-bit binary digits
   */
  data: number[]
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
      isActive: true
    },
    [IoDeviceName.TrafficLights]: {
      isActive: false,
      data: initialData
    },
    [IoDeviceName.SevenSegmentDisplay]: {
      isActive: false,
      data: initialData
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
    toggleDeviceActive: (state: IoState, action: PayloadAction<IoDeviceName>): void => {
      const name = action.payload
      state.devices[name].isActive = !state.devices[name].isActive
    },
    setDeviceData: (
      state,
      action: PayloadAction<{ name: IoDeviceWithData; data: number }>
    ): void => {
      const { name, data } = action.payload
      state.devices[name].data = decTo8bitBinDigits(data)
    },
    reset: () => initialState
  }
})

export const selectInputSignals = (state: RootState): InputSignals => state.io.inputSignals

export const selectIsWaitingForInput = (state: RootState): boolean => state.io.isWaitingForInput

export const selectIsWaitingForKeyboardInput = (state: RootState): boolean =>
  state.io.isWaitingForKeyboardInput

export const selectIoDevices = (state: RootState): IoDevices => state.io.devices

interface IoDeviceActivity {
  isActive: boolean
  toggleActive: () => ReturnType<typeof toggleIoDeviceActive>
}

type IoDeviceActivitySelector = (state: RootState) => IoDeviceActivity

export const createIoDeviceActivitySelector = (name: IoDeviceName): IoDeviceActivitySelector =>
  createSelector(
    (state: RootState) => state.io.devices[name].isActive,
    isActive => ({
      isActive,
      toggleActive: () => toggleIoDeviceActive(name)
    })
  )

export const selectIoDeviceData =
  (name: IoDeviceWithData) =>
  (state: RootState): number[] =>
    state.io.devices[name].data

export const {
  setInputData,
  clearInputData,
  setInterrupt,
  setWaitingForInput,
  setWaitingForKeyboardInput,
  toggleDeviceActive: toggleIoDeviceActive,
  setDeviceData: setIoDeviceData,
  reset: resetIo
} = ioSlice.actions

export default ioSlice.reducer
