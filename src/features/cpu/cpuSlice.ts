import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Registers, initRegisters, InputPort, InputSignals } from './core'
import { setAssemblerState } from '../assembler/assemblerSlice'
import type { RootState } from '../../app/store'

interface Status {
  fault: boolean
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
    halted: false
  },
  registers: initRegisters(),
  inputSignals: {
    data: undefined,
    inputPort: undefined,
    interrupt: false
  }
}

const reset = (): CpuState => initialState

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
    reset
  },
  extraReducers: builder => {
    builder.addCase(setAssemblerState, reset)
  }
})

export const selectCpuStatus = (state: RootState): Status => state.cpu.status

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
