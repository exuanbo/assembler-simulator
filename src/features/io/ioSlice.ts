import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { decTo8bitBinDigits, merge } from '@/common/utils'
import { getVduDataFrom, initVduData, type MemoryData } from '@/features/memory/core'

import { initialInputSignals, type InputPort, type InputSignals } from './core'

export enum IoDeviceName {
  VisualDisplayUnit = 'VisualDisplayUnit',
  TrafficLights = 'TrafficLights',
  SevenSegmentDisplay = 'Seven-segmentDisplay',
}

export const ioDeviceNames: readonly IoDeviceName[] = Object.values(IoDeviceName)

export type IoDeviceData = number[]

export interface IoDeviceState {
  data: IoDeviceData
  isVisible: boolean
}

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
    resetState: (state) => {
      type IoDeviceVisibilityState = Pick<IoDeviceState, 'isVisible'>
      return merge(initialState, {
        devices: Object.entries(state.devices).reduce<Record<string, IoDeviceVisibilityState>>(
          (visibilityStates, [name, { isVisible }]) =>
            Object.assign(visibilityStates, {
              [name]: { isVisible },
            }),
          {},
        ),
      })
    },
  },
  selectors: {
    selectInputSignals: (state) => state.inputSignals,
    selectIsWaitingForInput: (state) => state.isWaitingForInput,
    selectIsWaitingForKeyboardInput: (state) => state.isWaitingForKeyboardInput,
    selectIoDeviceStates: (state) => state.devices,
    selectIoDeviceData: (state, name: IoDeviceName) => state.devices[name].data,
    selectIoDeviceVisibility: (state, name: IoDeviceName) => state.devices[name].isVisible,
  },
})

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

export const {
  selectInputSignals,
  selectIsWaitingForInput,
  selectIsWaitingForKeyboardInput,
  selectIoDeviceStates,
  selectIoDeviceData,
  selectIoDeviceVisibility,
} = ioSlice.selectors
