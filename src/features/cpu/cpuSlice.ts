import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CPU, init } from './core'
import type { RootState } from '../../app/store'

type InputSignals = (
  | {
      data: number
      inputPort: number
    }
  | {
      data: undefined
      inputPort: undefined
    }
) & {
  interrupt: boolean
}

interface CPUState {
  internal: CPU
  inputSignals: InputSignals
}

const initialState: CPUState = {
  internal: init(),
  inputSignals: {
    data: undefined,
    inputPort: undefined,
    interrupt: false
  }
}

export const cpuSlice = createSlice({
  name: 'cpu',
  initialState,
  reducers: {
    setCPU: (state, action: PayloadAction<CPU>) => {
      state.internal = action.payload
    },
    setInput: (state, action: PayloadAction<{ data: number; inputPort: number }>) => {
      const { data, inputPort } = action.payload
      state.inputSignals.data = data
      state.inputSignals.inputPort = inputPort
    },
    clearInput: state => {
      state.inputSignals.data = undefined
      state.inputSignals.inputPort = undefined
    },
    setInterrupt: (state, action: PayloadAction<boolean>) => {
      state.inputSignals.interrupt = action.payload
    }
  }
})

export const selectCPU = (state: RootState): CPU => state.cpu.internal
export const selectInputSignals = (state: RootState): InputSignals => state.cpu.inputSignals

export const { setCPU, setInput, clearInput, setInterrupt } = cpuSlice.actions

export default cpuSlice.reducer
