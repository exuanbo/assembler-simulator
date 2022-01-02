import { PayloadAction, createSlice, createSelector } from '@reduxjs/toolkit'
import { InputSignals, InputPort, initialInputSignals } from './core'
import type { RootState } from '../../app/store'

interface IoState {
  inputSignals: InputSignals
  isWaitingForInput: boolean
  isWaitingForKeyboardInput: boolean
  trafficLightsData: number
}

const initialState: IoState = {
  inputSignals: initialInputSignals,
  isWaitingForInput: false,
  isWaitingForKeyboardInput: false,
  trafficLightsData: 0
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
    reset: () => initialState
  }
})

export const selectInputSignals = (state: RootState): InputSignals => state.io.inputSignals

export const selectIsWaitingForInput = (state: RootState): boolean => state.io.isWaitingForInput

export const selectIsWaitingForKeyboardInput = (state: RootState): boolean =>
  state.io.isWaitingForKeyboardInput

export const selectTrafficLightsDataDigits = createSelector(
  (state: RootState) => state.io.trafficLightsData,
  trafficLightsData => trafficLightsData.toString(2).padStart(8, '0').split('').map(Number)
)

export const {
  setInputData,
  clearInputData,
  setInterrupt,
  setWaitingForInput,
  setWaitingForKeyboardInput,
  setTrafficLightsData,
  reset: resetIo
} = ioSlice.actions

export default ioSlice.reducer
