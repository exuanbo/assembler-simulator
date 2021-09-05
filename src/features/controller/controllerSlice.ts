import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export enum ClockSpeed {
  '4 Hz' = 4,
  '8 Hz' = 8,
  '16 Hz' = 16,
  '32 Hz' = 32,
  '64 Hz' = 64
}

export const CLOCK_SPEED_KEYS = ['4 Hz', '8 Hz', '16 Hz', '32 Hz', '64 Hz'] as const

export enum TimerInterval {
  '1 second' = 1000,
  '2 seconds' = 2000,
  '4 seconds' = 4000,
  '8 seconds' = 8000
}

export const TIMER_INTERVAL_KEYS = ['1 second', '2 seconds', '4 seconds', '8 seconds'] as const

interface Configuration {
  clockSpeed: ClockSpeed
  timerInterval: TimerInterval
}

interface ControllerState {
  isRunning: boolean
  configuration: Configuration
}

const initialState: ControllerState = {
  isRunning: false,
  configuration: {
    clockSpeed: ClockSpeed['4 Hz'],
    timerInterval: TimerInterval['2 seconds']
  }
}

export const controllerSlice = createSlice({
  name: 'controller',
  initialState,
  reducers: {
    setRunning: (state, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload
    },
    setClockSpeed: (state, action: PayloadAction<ClockSpeed>) => {
      state.configuration.clockSpeed = action.payload
    },
    setTimerInterval: (state, action: PayloadAction<TimerInterval>) => {
      state.configuration.timerInterval = action.payload
    }
  }
})

export const selectIsRunning = (state: RootState): boolean => state.controller.isRunning

export const selectClockSpeed = (state: RootState): ClockSpeed =>
  state.controller.configuration.clockSpeed

export const selectTimerInterval = (state: RootState): TimerInterval =>
  state.controller.configuration.timerInterval

export const selectConfiguration = (state: RootState): Configuration =>
  state.controller.configuration

export const { setRunning, setClockSpeed, setTimerInterval } = controllerSlice.actions

export default controllerSlice.reducer
