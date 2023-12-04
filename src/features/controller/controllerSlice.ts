import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { UnionToTuple } from '@/common/utils'

export enum ClockSpeed {
  '2 Hz' = 2,
  '4 Hz' = 4,
  '8 Hz' = 8,
  '16 Hz' = 16,
  '32 Hz' = 32,
  '64 Hz' = 64,
}

export const clockSpeedOptionNames: Readonly<UnionToTuple<keyof typeof ClockSpeed>> = [
  '2 Hz',
  '4 Hz',
  '8 Hz',
  '16 Hz',
  '32 Hz',
  '64 Hz',
]

export enum TimerInterval {
  '1 second' = 1000,
  '2 seconds' = 2000,
  '4 seconds' = 4000,
  '8 seconds' = 8000,
}

export const timerIntervalOptionNames: Readonly<UnionToTuple<keyof typeof TimerInterval>> = [
  '1 second',
  '2 seconds',
  '4 seconds',
  '8 seconds',
]

interface Configuration {
  autoAssemble: boolean
  clockSpeed: ClockSpeed
  timerInterval: TimerInterval
  vimKeybindings: boolean
}

interface ControllerState {
  configuration: Configuration
  isRunning: boolean
  isSuspended: boolean
}

const initialState: ControllerState = {
  configuration: {
    autoAssemble: true,
    clockSpeed: ClockSpeed['4 Hz'],
    timerInterval: TimerInterval['2 seconds'],
    vimKeybindings: false,
  },
  isRunning: false,
  isSuspended: false,
}

export const controllerSlice = createSlice({
  name: 'controller',
  initialState,
  reducers: {
    setAutoAssemble: (state, action: PayloadAction<boolean>) => {
      state.configuration.autoAssemble = action.payload
    },
    setClockSpeed: (state, action: PayloadAction<ClockSpeed>) => {
      state.configuration.clockSpeed = action.payload
    },
    setTimerInterval: (state, action: PayloadAction<TimerInterval>) => {
      state.configuration.timerInterval = action.payload
    },
    setVimKeybindings: (state, action: PayloadAction<boolean>) => {
      state.configuration.vimKeybindings = action.payload
    },
    setRunning: (state, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload
    },
    setSuspended: (state, action: PayloadAction<boolean>) => {
      state.isSuspended = action.payload
    },
  },
  selectors: {
    selectAutoAssemble: (state) => state.configuration.autoAssemble,
    selectClockSpeed: (state) => state.configuration.clockSpeed,
    selectTimerInterval: (state) => state.configuration.timerInterval,
    selectRuntimeConfiguration: createSelector(
      (state: ControllerState) => state.configuration.clockSpeed,
      (state: ControllerState) => state.configuration.timerInterval,
      (clockSpeed, timerInterval) => ({ clockSpeed, timerInterval }),
    ),
    selectVimKeybindings: (state) => state.configuration.vimKeybindings,
    selectIsRunning: (state) => state.isRunning,
    selectIsSuspended: (state) => state.isSuspended,
    selectControllerStateToPersist: createSelector(
      (state: ControllerState) => state.configuration,
      (configuration) => ({ configuration }),
    ),
  },
})

export const {
  setAutoAssemble,
  setClockSpeed,
  setTimerInterval,
  setVimKeybindings,
  setRunning,
  setSuspended,
} = controllerSlice.actions

export const {
  selectAutoAssemble,
  selectClockSpeed,
  selectTimerInterval,
  selectRuntimeConfiguration,
  selectVimKeybindings,
  selectIsRunning,
  selectIsSuspended,
  selectControllerStateToPersist,
} = controllerSlice.selectors
