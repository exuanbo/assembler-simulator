import { useEffect } from 'react'
// TODO: remove batch from React 18
import { batch } from 'react-redux'
import type { RootState } from '../../app/store'
import { useShallowEqualSelector, useStore } from '../../app/hooks'
import { addActionListener } from '../../app/actionListener'
import {
  setRunning,
  setSuspended,
  selectIsRunning,
  selectIsSuspended,
  selectRuntimeConfiguration
} from './controllerSlice'
import {
  selectEditortInput,
  selectEditorBreakpoints,
  setEditorActiveRange
} from '../editor/editorSlice'
import {
  setAssemblerState,
  resetAssembler,
  selectAddressToStatementMap
} from '../assembler/assemblerSlice'
import { useAssembler } from '../assembler/hooks'
import { setMemoryData, resetMemory, selectMemoryData } from '../memory/memorySlice'
import { StepResult, step as __step } from '../cpu/core'
import { RuntimeError } from '../cpu/core/exceptions'
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

let stepIntervalId: number
let interruptIntervalId: number

const cancelMainLoop = (): void => {
  window.clearInterval(stepIntervalId)
  window.clearInterval(interruptIntervalId)
}

let lastStep: Promise<StepResult | undefined> = Promise.resolve(undefined)

let timeoutId: number | undefined

const cancelDispatchChanges = (): void => {
  window.clearTimeout(timeoutId)
  timeoutId = undefined
}

let removeSetSuspendedListener: () => void

interface Controller {
  assemble: () => void
  run: () => void
  step: () => Promise<void>
  reset: () => Promise<void>
}

export const useController = (): Controller => {
  const { getState, dispatch } = useStore()

  const __assemble = useAssembler()

  const assemble = (): void => {
    __assemble(selectEditortInput(getState()))
  }

  const __stop = (): void => {
    cancelMainLoop()
    dispatch(setRunning(false))
  }

  /**
   * @returns {boolean} if was running
   */
  const stopIfRunning = (state: RootState): boolean => {
    const isRunning = selectIsRunning(state)
    if (isRunning) {
      __stop()
    }
    return isRunning
  }

  /**
   * @returns {boolean} if was suspended
   */
  const restoreIfSuspended = (state: RootState): boolean => {
    const isSuspended = selectIsSuspended(state)
    if (isSuspended) {
      removeSetSuspendedListener()
      dispatch(setSuspended(false))
    }
    return isSuspended
  }

  const { clockSpeed, timerInterval } = useShallowEqualSelector(selectRuntimeConfiguration)

  const setMainLoop = (): void => {
    stepIntervalId = window.setInterval(step, 1000 / clockSpeed)
    interruptIntervalId = window.setInterval(() => {
      dispatch(setCpuInterrupt(true))
    }, timerInterval)
  }

  const __run = (): void => {
    dispatch(setRunning(true))
    setMainLoop()
    void step()
  }

  useEffect(() => {
    const state = getState()
    if (stopIfRunning(state) && !restoreIfSuspended(state)) {
      __run()
    }
  }, [clockSpeed, timerInterval])

  const run = (): void => {
    const state = getState()
    if (stopIfRunning(state)) {
      restoreIfSuspended(state)
      return
    }
    if (selectIsSuspended(state)) {
      return
    }
    __run()
  }

  const step = async (): Promise<void> => {
    const lastStepResult = await lastStep
    const state = getState()
    const { fault, halted } = selectCpuStatus(state)
    if (fault || halted) {
      stopIfRunning(state)
      return
    }
    if (selectIsSuspended(state)) {
      return
    }
    lastStep = new Promise(resolve => {
      let stepResultWithSignals: ReturnType<typeof __step>
      try {
        stepResultWithSignals = __step(
          ...(lastStepResult ?? [selectMemoryData(state), selectCpuRegisters(state)]),
          selectCpuInputSignals(state)
        )
      } catch (err) {
        stopIfRunning(state)
        if (err instanceof RuntimeError) {
          dispatch(setCpuFault(err.message))
          resolve(undefined)
          return
        }
        resolve(undefined)
        // TODO: handle unexpected runtime errors
        throw err
      }
      const [memoryData, registers, outputSignals] = stepResultWithSignals
      const instructionAdress = registers.ip
      const statement = selectAddressToStatementMap(state)[instructionAdress]
      const hasStatement = statement?.machineCode.every(
        (machineCode, index) => machineCode === memoryData[instructionAdress + index]
      )
      const dispatchChanges = (): void => {
        timeoutId = window.setTimeout(() => {
          batch(() => {
            dispatch(setMemoryData(memoryData))
            dispatch(setCpuRegisters(registers))
            dispatch(setEditorActiveRange(hasStatement ? statement : undefined))
          })
          timeoutId = undefined
        })
      }
      let willDispatchChanges = false
      if (timeoutId === undefined) {
        willDispatchChanges = true
        dispatchChanges()
      }
      // TODO: handle output signals
      const { halted = false, interrupt, data, inputPort } = outputSignals
      if (halted) {
        stopIfRunning(state)
        dispatch(setCpuHalted(true))
        resolve(undefined)
        return
      }
      if (interrupt) {
        dispatch(setCpuInterrupt(false))
      }
      const isRunning = selectIsRunning(state)
      let willSuspend = false
      if (inputPort !== undefined) {
        if (data === undefined) {
          willSuspend = true
          if (isRunning) {
            cancelMainLoop()
          }
          dispatch(setSuspended(true))
          removeSetSuspendedListener = addActionListener(setSuspended, () => {
            removeSetSuspendedListener()
            if (isRunning) {
              setMainLoop()
            }
            void step()
          })
        } else {
          dispatch(clearCpuInput())
        }
      }
      const breakpoints = selectEditorBreakpoints(state)
      if (breakpoints.length > 0 && hasStatement && isRunning && !willSuspend) {
        const { label, range: __range } = statement
        const range = {
          from: label === null ? __range.from : label.range.from,
          to: __range.to
        }
        const willBreak = breakpoints.some(
          ({ from, to }) =>
            (range.from <= from && from < range.to) || (range.from < to && to <= range.to)
        )
        if (willBreak) {
          if (!willDispatchChanges) {
            dispatchChanges()
          }
          __stop()
        }
      }
      resolve([memoryData, registers])
    })
  }

  const __reset = async (): Promise<void> => {
    const state = getState()
    stopIfRunning(state)
    restoreIfSuspended(state)
    await lastStep
    lastStep = Promise.resolve(undefined)
    cancelDispatchChanges()
  }

  useEffect(() => addActionListener(setAssemblerState, __reset), [])

  const reset = async (): Promise<void> => {
    await __reset()
    batch(() => {
      dispatch(resetMemory())
      dispatch(resetCpu())
      dispatch(resetAssembler())
      dispatch(setEditorActiveRange(undefined))
    })
  }

  return {
    assemble,
    run,
    step,
    reset
  }
}
