import { useState, useEffect, useCallback } from 'react'
import { useAppSelector, useAppStore } from '../../app/hooks'
import { subscribe } from '../../app/sideEffect'
import {
  setRunning,
  setSuspended,
  selectIsRunning,
  selectIsSuspended,
  selectConfiguration
} from './controllerSlice'
import { selectEditortInput } from '../editor/editorSlice'
import { setAssemblerState } from '../assembler/assemblerSlice'
import { useAssembler } from '../assembler/hooks'
import { setMemoryData, resetMemory, selectMemoryData } from '../memory/memorySlice'
import { StepResult, step, RuntimeError } from '../cpu/core'
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

type RefCallback<T> = (node: T) => void

export const useOutsideClick = <T extends Element = Element>(): [
  clickRef: RefCallback<T>,
  isClicked: boolean
] => {
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

export const useHover = <T extends Element = Element>(): [
  hoverRef: RefCallback<T>,
  isHovered: boolean
] => {
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

let stepIntervalId: number
let interruptIntervalId: number

const clearIntervalJob = (): void => {
  window.clearInterval(stepIntervalId)
  window.clearInterval(interruptIntervalId)
}

let lastStep: Promise<StepResult | undefined>
let requestId: number | undefined

let unsubscribeSetSuspended: () => void

interface Controller {
  assemble: () => void
  run: () => void
  step: () => Promise<void>
  reset: () => void
}

export const useController = (): Controller => {
  const store = useAppStore()
  const { dispatch } = store

  const assemble = useAssembler()

  const __assemble = (): void => {
    const input = selectEditortInput(store.getState())
    assemble(input)
  }

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
    stepIntervalId = window.setInterval(__step, 1000 / clockSpeed)
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
        if (requestId === undefined && !halted) {
          requestId = window.requestAnimationFrame(() => {
            dispatch(setMemoryData(memoryData))
            dispatch(setCpuRegisters(registers))
            requestId = undefined
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
    assemble: __assemble,
    run: __run,
    step: __step,
    reset: __reset
  }
}
