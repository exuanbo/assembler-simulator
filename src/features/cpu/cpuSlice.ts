import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  type GeneralPurposeRegister,
  initRegisters,
  type Registers,
  type RuntimeErrorObject,
} from './core'

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

const createTypedStateSelector = createSelector.withTypes<CpuState>()

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
    selectCpuGeneralPurposeRegister: createTypedStateSelector(
      [(state) => state.registers.gpr, (_, code: GeneralPurposeRegister) => code],
      (gpr, code) => gpr[code],
    ),
    selectCpuInstructionPointerRegister: (state) => state.registers.ip,
    selectCpuStackPointerRegister: (state) => state.registers.sp,
    selectCpuPointerRegisters: createTypedStateSelector(
      [(state) => state.registers.ip, (state) => state.registers.sp],
      (ip, sp) => ({ ip, sp }),
    ),
    selectCpuStatusRegister: (state) => state.registers.sr,
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
  selectCpuGeneralPurposeRegister,
  selectCpuInstructionPointerRegister,
  selectCpuStackPointerRegister,
  selectCpuPointerRegisters,
  selectCpuStatusRegister,
} = cpuSlice.selectors
