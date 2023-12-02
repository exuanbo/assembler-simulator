import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'
import { decTo8bitBinDigits, merge } from '@/common/utils'
import { getVduDataFrom, initVduData, MemoryData } from '@/features/memory/core'

import { initialInputSignals, InputPort, InputSignals } from './core'

export enum IoDeviceName {
  VisualDisplayUnit = 'VisualDisplayUnit',
  TrafficLights = 'TrafficLights',
  SevenSegmentDisplay = 'Seven-segmentDisplay',
}

export const ioDeviceNames: readonly IoDeviceName[] = Object.values(IoDeviceName)

export interface IoDeviceState {
  data: number[]
  isVisible: boolean
}

type IoDeviceVisibility = Pick<IoDeviceState, 'isVisible'>

type IoDeviceStates = {
  [name in IoDeviceName]: IoDeviceState
}

interface IoState {
  inputSignals: InputSignals
  isWaitingForInput: boolean
  isWaitingForKeyboardInput: boolean
  devices: IoDeviceStates
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
      isVisible: true,
    },
    [IoDeviceName.TrafficLights]: {
      data: initialData,
      isVisible: false,
    },
    [IoDeviceName.SevenSegmentDisplay]: {
      data: initialData,
      isVisible: false,
    },
  },
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
    clearInputData: (state) => {
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
    setDevicesInvisible: (state) => {
      ioDeviceNames.forEach((name) => {
        state.devices[name].isVisible = false
      })
    },
    resetState: (state) =>
      merge(initialState, {
        devices: Object.entries(state.devices).reduce<Record<string, IoDeviceVisibility>>(
          (visibilityStates, [name, { isVisible }]) =>
            Object.assign(visibilityStates, {
              [name]: { isVisible },
            }),
          {},
        ),
      }),
  },
})

export const selectInputSignals = (state: RootState): InputSignals => state.io.inputSignals

export const selectIsWaitingForInput = (state: RootState): boolean => state.io.isWaitingForInput

export const selectIsWaitingForKeyboardInput = (state: RootState): boolean =>
  state.io.isWaitingForKeyboardInput

export const selectIoDeviceStates = (state: RootState): IoDeviceStates => state.io.devices

export const selectIoDeviceData =
  (name: IoDeviceName) =>
  (state: RootState): number[] =>
    state.io.devices[name].data

export const selectIoDeviceVisibility =
  (name: IoDeviceName) =>
  (state: RootState): boolean =>
    state.io.devices[name].isVisible

export const {
  setInputData,
  clearInputData,
  setInterrupt,
  setWaitingForInput,
  setWaitingForKeyboardInput,
  setVduDataFrom,
  setDeviceData: setIoDeviceData,
  toggleDeviceVisible: toggleIoDeviceVisible,
  setDevicesInvisible: setIoDevicesInvisible,
  resetState: resetIoState,
} = ioSlice.actions

export default ioSlice.reducer
