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
import { step } from '../cpu/core'
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
      const handleMouseOver = (): void => setHovered(true)
      const handleMouseOut = (): void => setHovered(false)

      current.addEventListener('mouseenter', handleMouseOver)
      current.addEventListener('mouseleave', handleMouseOut)

      return () => {
        current.removeEventListener('mouseenter', handleMouseOver)
        current.removeEventListener('mouseleave', handleMouseOut)
      }
    }
  }, [current])

  return [refCallback, isHovered]
}

// TODO: put them in controllerSlice
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
    await lastJob
    lastJob = new Promise((resolve, reject) => {
      // const startTime = performance.now()
      const state = store.getState()
      const { fault, halted } = selectCpuStatus(state)
      if (fault) {
        // TODO: handle fault
      }
      if (halted) {
        // TODO: handle halted
        stopIfRunning()
        resolve()
        return
      }
      try {
        const [memoryData, registers, outputSignals] = step(
          selectMemoryData(state),
          selectCpuRegisters(state),
          selectCpuInputSignals(state)
        )
        dispatch(setMemoryData(memoryData))
        dispatch(setCpuRegisters(registers))
        // TODO: handle output
        const { halted = false, interrupt } = outputSignals
        if (halted) {
          stopIfRunning()
          dispatch(setCpuHalted(true))
        }
        if (interrupt) {
          dispatch(setCpuInterrupt(false))
        }
      } catch (err) {
        if (err instanceof RuntimeError) {
          stopIfRunning()
          dispatch(setCpuFault(true))
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
    run: __run,
    step: __step,
    reset: __reset
  }
}
