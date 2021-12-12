import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { Registers, initRegisters, InputPort, InputSignals } from './core'
import type { RootState } from '../../app/store'

// TODO: use faultMessage only and add a selector to return boolean
type Status =
  | {
      fault: false
      faultMessage: null
      halted: boolean
    }
  | {
      fault: true
      faultMessage: string
      halted: boolean
    }

interface CpuState {
  status: Status
  registers: Registers
  inputSignals: InputSignals
}

const initialState: CpuState = {
  status: {
    fault: false,
    faultMessage: null,
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
    setFault: (state, action: PayloadAction<string>) => {
      state.status.fault = true
      state.status.faultMessage = action.payload
    },
    setHalted: (state, action: PayloadAction<boolean>) => {
      state.status.halted = action.payload
    },
    setRegisters: (state, action: PayloadAction<Registers>) => {
      state.registers = action.payload
    },
    setInput: (state, action: PayloadAction<{ data: number; inputPort: InputPort }>) => {
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
    },
    reset: () => initialState
  }
})

export const selectCpuStatus = (state: RootState): Status => state.cpu.status

export const selectCpuFaultMessage = (state: RootState): string | null =>
  state.cpu.status.faultMessage

export const selectCpuRegisters = (state: RootState): Registers => state.cpu.registers

export const selectCpuPointerRegisters = (state: RootState): Pick<Registers, 'ip' | 'sp'> =>
  (({ ip, sp }) => ({ ip, sp }))(state.cpu.registers)

export const selectCpuInputSignals = (state: RootState): InputSignals => state.cpu.inputSignals

export const {
  setFault: setCpuFault,
  setHalted: setCpuHalted,
  setRegisters: setCpuRegisters,
  setInput: setCpuInput,
  clearInput: clearCpuInput,
  setInterrupt: setCpuInterrupt,
  reset: resetCpu
} = cpuSlice.actions

export default cpuSlice.reducer
