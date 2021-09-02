import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Registers, initRegisters } from './core'
import type { RootState } from '../../app/store'

interface Status {
  fault: boolean
  halted: boolean
}

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
  status: Status
  registers: Registers
  inputSignals: InputSignals
}

const initialState: CPUState = {
  status: {
    fault: false,
    halted: false
  },
  registers: initRegisters(),
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
    setFault: (state, action: PayloadAction<boolean>) => {
      state.status.fault = action.payload
    },
    setHalted: (state, action: PayloadAction<boolean>) => {
      state.status.halted = action.payload
    },
    setRegisters: (state, action: PayloadAction<Registers>) => {
      state.registers = action.payload
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

export const selectStatus = (state: RootState): Status => state.cpu.status

export const selectRegisters = (state: RootState): Registers => state.cpu.registers

export const selectIPnSP = (state: RootState): Pick<Registers, 'ip' | 'sp'> =>
  (({ ip, sp }) => ({ ip, sp }))(state.cpu.registers)

export const selectInputSignals = (state: RootState): InputSignals => state.cpu.inputSignals

export const { setFault, setHalted, setRegisters, setInput, clearInput, setInterrupt } =
  cpuSlice.actions

export default cpuSlice.reducer
