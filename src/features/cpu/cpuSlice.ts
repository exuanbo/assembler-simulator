import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { initRegisters, type Registers, type RuntimeErrorObject } from './core'

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
    halted: false,
  },
  registers: initRegisters(),
}

export const cpuSlice = createSlice({
  name: 'cpu',
  initialState,
  reducers: {
    setFault: (state, action: PayloadAction<RuntimeErrorObject>) => {
      state.status.fault = action.payload
    },
    setHalted: (state) => {
      state.status.halted = true
    },
    setRegisters: (state, action: PayloadAction<Registers>) => {
      state.registers = action.payload
    },
    resetState: () => initialState,
  },
  selectors: {
    selectCpuStatus: (state) => state.status,
    selectCpuFault: (state) => state.status.fault,
    selectCpuRegisters: (state) => state.registers,
    selectCpuGeneralPurposeRegisters: (state) => state.registers.gpr,
    selectCpuInstructionPointer: (state) => state.registers.ip,
    selectCpuStackPointer: (state) => state.registers.sp,
    selectCpuPointerRegisters: createSelector(
      (state: CpuState) => state.registers.ip,
      (state: CpuState) => state.registers.sp,
      (ip, sp) => ({ ip, sp }),
    ),
    selectStatusRegister: (state) => state.registers.sr,
  },
})

export const {
  setFault: setCpuFault,
  setHalted: setCpuHalted,
  setRegisters: setCpuRegisters,
  resetState: resetCpuState,
} = cpuSlice.actions

export const {
  selectCpuStatus,
  selectCpuFault,
  selectCpuRegisters,
  selectCpuGeneralPurposeRegisters,
  selectCpuInstructionPointer,
  selectCpuStackPointer,
  selectCpuPointerRegisters,
  selectStatusRegister,
} = cpuSlice.selectors
