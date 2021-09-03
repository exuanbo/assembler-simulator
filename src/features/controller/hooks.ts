import React, { useState } from 'react'
import { useStore } from 'react-redux'
import { useAppDispatch } from '../../app/hooks'
import { setMemoryData, resetMemory, selectMemoryData } from '../memory/memorySlice'
import {
  setFault,
  setHalted,
  setRegisters,
  setInterrupt,
  resetCpu,
  selectStatus,
  selectRegisters,
  selectInputSignals
} from '../cpu/cpuSlice'
import { step } from '../cpu/core'
import { RuntimeError } from '../../common/exceptions'

const FREQ = 4
const TIMER_INTERVAL = 2000

let intervalId: number
let interruptIntervalId: number

let lastJob: Promise<void> = Promise.resolve()

interface Controller {
  isRunning: () => boolean
  run: () => void
  step: () => Promise<void>
  reset: () => void
}

export const useController = (): Controller => {
  let isRunning: boolean
  let setRunning: React.Dispatch<React.SetStateAction<boolean>>

  const dispatch = useAppDispatch()
  const store = useStore()

  const __isRunning = (): boolean => {
    ;[isRunning, setRunning] = useState<boolean>(false)
    return isRunning
  }

  const stop = (): void => {
    window.clearInterval(intervalId)
    window.clearInterval(interruptIntervalId)
    setRunning(false)
  }

  /**
   * @returns {boolean} if stopped
   */
  const stopIfRunning = (): boolean => {
    if (isRunning) {
      stop()
      return true
    }
    return false
  }

  const run = (): void => {
    if (stopIfRunning()) {
      return
    }
    intervalId = window.setInterval(__step, 1000 / FREQ)
    interruptIntervalId = window.setInterval(() => dispatch(setInterrupt(true)), TIMER_INTERVAL)
    setRunning(true)
  }

  const __step = async (): Promise<void> => {
    await lastJob
    lastJob = new Promise((resolve, reject) => {
      // const startTime = performance.now()
      const state = store.getState()
      const { fault, halted } = selectStatus(state)
      if (fault) {
        // TODO: handle fault
      }
      if (halted) {
        // TODO: handle halted
        resolve()
        return
      }
      try {
        const [memoryData, registers, outputSignals] = step(
          selectMemoryData(state),
          selectRegisters(state),
          selectInputSignals(state)
        )
        dispatch(setMemoryData(memoryData))
        dispatch(setRegisters(registers))
        // TODO: handle output
        const { halted = false, interrupt } = outputSignals
        if (halted) {
          stopIfRunning()
          dispatch(setHalted(true))
        }
        if (interrupt) {
          dispatch(setInterrupt(false))
        }
      } catch (err) {
        if (err instanceof RuntimeError) {
          stopIfRunning()
          dispatch(setFault(true))
        }
        // TODO: handle exceptions
      }
      // console.log(performance.now() - startTime)
      resolve()
    })
  }

  const __reset = (): void => {
    stopIfRunning()
    dispatch(resetCpu())
    dispatch(resetMemory())
  }

  return {
    isRunning: __isRunning,
    run,
    step: __step,
    reset: __reset
  }
}
