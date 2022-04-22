import { PayloadAction, createSlice, createSelector } from '@reduxjs/toolkit'
import {
  RuntimeErrorObject,
  GeneralPurposeRegisters,
  InstructionPointer,
  StackPointer,
  StatusRegister,
  Registers,
  initRegisters,
  getSrValue
} from './core'
import type { RootState } from '@/app/store'

interface Status {
  fault: RuntimeErrorObject | null
  halted: boolean
}

interface CpuState {
  status: Status
  registers: Registers
}

const initialState: CpuState = {
  status: {
    fault: null,
    halted: false
  },
  registers: initRegisters()
}

export const cpuSlice = createSlice({
  name: 'cpu',
  initialState,
  reducers: {
    setFault: (state, action: PayloadAction<RuntimeErrorObject>) => {
      state.status.fault = action.payload
    },
    setHalted: state => {
      state.status.halted = true
    },
    setRegisters: (state, action: PayloadAction<Registers>) => {
      state.registers = action.payload
    },
    resetState: () => initialState
  }
})

export const selectCpuStatus = (state: RootState): Status => state.cpu.status

export const selectCpuFault = (state: RootState): RuntimeErrorObject | null =>
  state.cpu.status.fault

export const selectCpuRegisters = (state: RootState): Registers => state.cpu.registers

export const selectCpuGeneralPurposeRegisters = (state: RootState): GeneralPurposeRegisters =>
  state.cpu.registers.gpr

const selectCpuInstructionPointer = (state: RootState): InstructionPointer => state.cpu.registers.ip

const selectCpuStackPointer = (state: RootState): StackPointer => state.cpu.registers.sp

export const selectCpuPointerRegisters = createSelector(
  selectCpuInstructionPointer,
  selectCpuStackPointer,
  (ip, sp) => ({ ip, sp })
)

const selectStatusRegister = (state: RootState): StatusRegister => state.cpu.registers.sr

export const selectStatusRegisterValue = createSelector(selectStatusRegister, getSrValue)

export const {
  setFault: setCpuFault,
  setHalted: setCpuHalted,
  setRegisters: setCpuRegisters,
  resetState: resetCpuState
} = cpuSlice.actions

export default cpuSlice.reducer
