import { useState, useEffect, useCallback } from 'react'
import { useAppSelector, useAppStore } from '../../app/hooks'
import { subscribe } from '../../app/sideEffect'
import { StepResult, step } from '../cpu/core'
import {
  setRunning,
  setSuspended,
  selectIsRunning,
  selectIsSuspended,
  selectConfiguration
} from './controllerSlice'
import { setMemoryData, resetMemory, selectMemoryData } from '../memory/memorySlice'
import {
  setCpuFault,
  setCpuHalted,
  setCpuRegisters,
  setCpuInterrupt,
  clearCpuInput,
  resetCpu,
  selectCpuStatus,
  selectCpuRegisters,
  selectCpuInputSignals
} from '../cpu/cpuSlice'
import { setAssemblerState } from '../assembler/assemblerSlice'
import { RuntimeError } from '../../common/exceptions'

export const useOutsideClick = <T extends Element = Element>(): [(node: T) => void, boolean] => {
  const [current, setCurrent] = useState<T | null>(null)
  const [isClicked, setClicked] = useState<boolean>(false)

  const refCallback = useCallback((node: T) => {
    setCurrent(node)
  }, [])

  useEffect(() => {
    if (current !== null) {
      const handleOutsideClick = ({ target }: MouseEvent): void => {
        if (target instanceof Element) {
          setClicked(!current.contains(target))
        }
      }
      document.addEventListener('mousedown', handleOutsideClick)
      return () => {
        setClicked(false)
        document.removeEventListener('mousedown', handleOutsideClick)
      }
    }
  }, [current])

  return [refCallback, isClicked]
}

export const useHover = <T extends Element = Element>(): [(node: T) => void, boolean] => {
  const [current, setCurrent] = useState<T | null>(null)
  const [isHovered, setHovered] = useState<boolean>(false)

  const refCallback = useCallback((node: T) => {
    setCurrent(node)
  }, [])

  useEffect(() => {
    if (current !== null) {
      const handleMouseEnter = (): void => setHovered(true)
      const handleMouseLeave = (): void => setHovered(false)

      current.addEventListener('mouseenter', handleMouseEnter)
      current.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        setHovered(false)

        current.removeEventListener('mouseenter', handleMouseEnter)
        current.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [current])

  return [refCallback, isHovered]
}

let intervalId: number
let interruptIntervalId: number

const clearIntervalJob = (): void => {
  window.clearInterval(intervalId)
  window.clearInterval(interruptIntervalId)
}

let lastStep: Promise<StepResult | undefined>
let animationFrameId: number | undefined

let unsubscribeSetSuspended: () => void

interface Controller {
  run: () => void
  step: () => Promise<void>
  reset: () => void
}

export const useController = (): Controller => {
  const store = useAppStore()
  const { dispatch } = store

  /**
   * @returns {boolean} if was running
   */
  const stopIfRunning = (): boolean => {
    const state = store.getState()
    const isRunning = selectIsRunning(state)
    if (isRunning) {
      clearIntervalJob()
      dispatch(setRunning(false))
    }
    if (selectIsSuspended(state)) {
      unsubscribeSetSuspended()
      dispatch(setSuspended(false))
    }
    return isRunning
  }

  const { clockSpeed, timerInterval } = useAppSelector(selectConfiguration)

  const setIntervalJob = (): void => {
    intervalId = window.setInterval(__step, 1000 / clockSpeed)
    interruptIntervalId = window.setInterval(() => dispatch(setCpuInterrupt(true)), timerInterval)
  }

  const run = (): void => {
    setIntervalJob()
    dispatch(setRunning(true))
  }

  useEffect(() => {
    if (stopIfRunning()) {
      run()
    }
  }, [clockSpeed, timerInterval])

  const __run = (): void => {
    if (stopIfRunning()) {
      return
    }
    run()
  }

  const __step = async (): Promise<void> => {
    const lastStepResult = await lastStep
    const state = store.getState()
    if (selectIsSuspended(state)) {
      return
    }
    lastStep = new Promise(resolve => {
      // const startTime = performance.now()
      const { fault, halted } = selectCpuStatus(state)
      if (fault) {
        // TODO: handle fault
        resolve(undefined)
        return
      }
      if (halted) {
        stopIfRunning()
        // TODO: handle halted
        resolve(undefined)
        return
      }
      try {
        const [memoryData, registers, outputSignals] = step(
          ...(lastStepResult ?? [selectMemoryData(state), selectCpuRegisters(state)]),
          selectCpuInputSignals(state)
        )
        // TODO: handle output
        const { halted = false, interrupt, data, inputPort } = outputSignals
        if (animationFrameId === undefined && !halted) {
          animationFrameId = window.requestAnimationFrame(() => {
            dispatch(setMemoryData(memoryData))
            dispatch(setCpuRegisters(registers))
            animationFrameId = undefined
          })
        }
        if (halted) {
          stopIfRunning()
          dispatch(setCpuHalted(true))
          resolve(undefined)
          return
        }
        if (interrupt) {
          dispatch(setCpuInterrupt(false))
        }
        if (inputPort !== undefined) {
          if (data === undefined) {
            const isRunning = selectIsRunning(state)
            if (isRunning) {
              clearIntervalJob()
            }
            dispatch(setSuspended(true))
            unsubscribeSetSuspended = subscribe(setSuspended.type, async () => {
              await __step()
              if (isRunning) {
                setIntervalJob()
              }
              unsubscribeSetSuspended()
            })
          } else {
            dispatch(clearCpuInput())
          }
        }
        resolve([memoryData, registers])
      } catch (err) {
        if (err instanceof RuntimeError) {
          stopIfRunning()
          dispatch(setCpuFault(true))
          // TODO: handle exceptions
        }
        resolve(undefined)
      }
      // console.log(performance.now() - startTime)
    })
  }

  const reset = (): void => {
    stopIfRunning()
    lastStep = Promise.resolve(undefined)
  }

  useEffect(() => subscribe(setAssemblerState.type, reset), [])

  const __reset = (): void => {
    reset()
    dispatch(resetCpu())
    dispatch(resetMemory())
  }

  return {
    run: __run,
    step: __step,
    reset: __reset
  }
}
