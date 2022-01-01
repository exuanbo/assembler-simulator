import { PayloadAction, createSlice, createSelector } from '@reduxjs/toolkit'
import { Signals, InputPort, initialSignals } from './core'
import type { RootState } from '../../app/store'

interface IoState {
  signals: Signals
  isWaitingForKeyboardInput: boolean
  trafficLightsData: number
}

const initialState: IoState = {
  signals: initialSignals,
  isWaitingForKeyboardInput: false,
  trafficLightsData: 0
}

export const ioSlice = createSlice({
  name: 'io',
  initialState,
  reducers: {
    setInputData: (state, action: PayloadAction<{ content: number; port: InputPort }>) => {
      const { content, port } = action.payload
      state.signals.input.data.content = content
      state.signals.input.data.port = port
    },
    clearInputData: state => {
      state.signals.input.data.content = null
      state.signals.input.data.port = null
    },
    setInterrupt: (state, action: PayloadAction<boolean>) => {
      state.signals.input.interrupt = action.payload
    },
    setRequiredInputDataPort: (state, action: PayloadAction<InputPort>) => {
      state.signals.output.requiredInputDataPort = action.payload
    },
    clearRequiredInputDataPort: state => {
      state.signals.output.requiredInputDataPort = null
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

export const selectSignals = (state: RootState): Signals => state.io.signals

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
  setRequiredInputDataPort,
  clearRequiredInputDataPort,
  setWaitingForKeyboardInput,
  setTrafficLightsData,
  reset: resetIo
} = ioSlice.actions

export default ioSlice.reducer
