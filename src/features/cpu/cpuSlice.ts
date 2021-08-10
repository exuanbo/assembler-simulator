import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CPU, init } from './core'
import type { RootState } from '../../app/store'

const initialState = init()

export const cpuSlice = createSlice({
  name: 'cpu',
  initialState,
  reducers: {
    setState: (_state, action: PayloadAction<CPU>) => action.payload
  }
})

export const selectCPU = (state: RootState): CPU => state.cpu

export const { setState } = cpuSlice.actions

export default cpuSlice.reducer
