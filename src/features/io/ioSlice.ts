import { PayloadAction, createSlice, createSelector } from '@reduxjs/toolkit'
import { InputSignals, InputPort, initialInputSignals } from './core'
import type { RootState } from '@/app/store'
import { decTo8bitBinDigits } from '@/common/utils'

interface IoState {
  inputSignals: InputSignals
  isWaitingForInput: boolean
  isWaitingForKeyboardInput: boolean
  trafficLightsData: number
  sevenSegmentDisplayData: number
}

const initialState: IoState = {
  inputSignals: initialInputSignals,
  isWaitingForInput: false,
  isWaitingForKeyboardInput: false,
  trafficLightsData: 0,
  sevenSegmentDisplayData: 0
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
    setTrafficLightsData: (state, action: PayloadAction<number>): void => {
      state.trafficLightsData = action.payload
    },
    setSevenSegmentDisplayData: (state, action: PayloadAction<number>): void => {
      state.sevenSegmentDisplayData = action.payload
    },
    reset: () => initialState
  }
})

export const selectInputSignals = (state: RootState): InputSignals => state.io.inputSignals

export const selectIsWaitingForInput = (state: RootState): boolean => state.io.isWaitingForInput

export const selectIsWaitingForKeyboardInput = (state: RootState): boolean =>
  state.io.isWaitingForKeyboardInput

const selectTrafficLightsData = (state: RootState): number => state.io.trafficLightsData

export const selectTrafficLightsDataDigits = createSelector(
  selectTrafficLightsData,
  decTo8bitBinDigits
)

const selectSevenSegmentDisplayData = (state: RootState): number => state.io.sevenSegmentDisplayData

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
  setTrafficLightsData,
  setSevenSegmentDisplayData,
  reset: resetIo
} = ioSlice.actions

export default ioSlice.reducer
