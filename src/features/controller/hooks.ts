import { useState, useEffect, useCallback } from 'react'
import { useStore } from 'react-redux'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { setRunning, selectIsRunning, selectConfiguration } from './controllerSlice'
import { setMemoryData, resetMemory, selectMemoryData } from '../memory/memorySlice'
import {
  setCpuFault,
  setCpuHalted,
  setCpuRegisters,
  setCpuInterrupt,
  resetCpu,
  selectCpuStatus,
  selectCpuRegisters,
  selectCpuInputSignals
} from '../cpu/cpuSlice'
import { StepResult, step } from '../cpu/core'
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
        current.removeEventListener('mouseenter', handleMouseEnter)
        current.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [current])

  return [refCallback, isHovered]
}

let intervalId: number
let interruptIntervalId: number

let lastStep: Promise<StepResult | undefined> = Promise.resolve(undefined)
let animationFrameId: number | undefined

interface Controller {
  isRunning: () => boolean
  run: () => void
  step: () => Promise<void>
  reset: () => void
}

export const useController = (): Controller => {
  let isRunning: boolean

  const __isRunning = (): boolean => {
    isRunning = useAppSelector(selectIsRunning)
    return isRunning
  }

  const dispatch = useAppDispatch()

  const stop = (): void => {
    window.clearInterval(intervalId)
    window.clearInterval(interruptIntervalId)
    dispatch(setRunning(false))
  }

  /**
   * @returns {boolean} if was running
   */
  const stopIfRunning = (): boolean => {
    if (isRunning) {
      stop()
      return true
    }
    return false
  }

  const { clockSpeed, timerInterval } = useAppSelector(selectConfiguration)

  const run = (): void => {
    intervalId = window.setInterval(__step, 1000 / clockSpeed)
    interruptIntervalId = window.setInterval(() => dispatch(setCpuInterrupt(true)), timerInterval)
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

  const store = useStore()

  const __step = async (): Promise<void> => {
    const lastStepResult = await lastStep
    lastStep = new Promise((resolve, reject) => {
      // const startTime = performance.now()
      const state = store.getState()
      const { fault, halted } = selectCpuStatus(state)
      if (fault) {
        // TODO: handle fault
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
        const { halted = false, interrupt } = outputSignals
        if (animationFrameId === undefined || halted) {
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

  const __reset = (): void => {
    stopIfRunning()
    dispatch(resetCpu())
    dispatch(resetMemory())
    lastStep = Promise.resolve(undefined)
  }

  return {
    isRunning: __isRunning,
    run: __run,
    step: __step,
    reset: __reset
  }
}
