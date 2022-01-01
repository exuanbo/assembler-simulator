import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { Signals, InputPort, initialSignals } from './core'
import type { RootState } from '../../app/store'

interface IoState {
  isWaitingForKeyboardInput: boolean
  signals: Signals
}

const initialState: IoState = {
  isWaitingForKeyboardInput: false,
  signals: initialSignals
}

export const ioSlice = createSlice({
  name: 'io',
  initialState,
  reducers: {
    setWaitingForKeyboardInput: (state, action: PayloadAction<boolean>): void => {
      state.isWaitingForKeyboardInput = action.payload
    },
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
    }
  }
})

export const selectIsWaitingForKeyboardInput = (state: RootState): boolean =>
  state.io.isWaitingForKeyboardInput

export const selectSignals = (state: RootState): Signals => state.io.signals

export const {
  setWaitingForKeyboardInput,
  setInputData,
  clearInputData,
  setInterrupt,
  setRequiredInputDataPort,
  clearRequiredInputDataPort
} = ioSlice.actions

export default ioSlice.reducer
