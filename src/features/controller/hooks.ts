import { useEffect } from 'react'
// TODO: remove batch from React 18
import { batch } from 'react-redux'
import type { RootState } from '../../app/store'
import { useShallowEqualSelector, useStore } from '../../app/hooks'
import { addActionListener } from '../../app/actionListener'
import {
  selectRuntimeConfiguration,
  selectIsRunning,
  selectIsSuspended,
  setRunning,
  setSuspended
} from './controllerSlice'
import {
  selectEditortInput,
  selectEditorBreakpoints,
  setEditorActiveRange,
  clearEditorActiveRange
} from '../editor/editorSlice'
import {
  selectAddressToStatementMap,
  setAssemblerState,
  resetAssembler
} from '../assembler/assemblerSlice'
import { useAssembler } from '../assembler/hooks'
import { setMemoryData, resetMemory, selectMemoryData } from '../memory/memorySlice'
import { StepResult, step as __step } from '../cpu/core'
import { RuntimeError } from '../cpu/core/exceptions'
import {
  selectCpuStatus,
  selectCpuRegisters,
  setCpuFault,
  setCpuHalted,
  setCpuRegisters,
  resetCpu
} from '../cpu/cpuSlice'
import { InputPort } from '../io/core'
import {
  selectSignals,
  setWaitingForKeyboardInput,
  clearInputData,
  setInterrupt,
  setRequiredInputDataPort,
  clearRequiredInputDataPort
} from '../io/ioSlice'

let stepIntervalId: number
let interruptIntervalId: number

const cancelMainLoop = (): void => {
  window.clearInterval(stepIntervalId)
  window.clearInterval(interruptIntervalId)
}

let lastStep: Promise<StepResult | undefined> = Promise.resolve(undefined)

let dispatchChangesTimeoutId: number | undefined

const cancelDispatchChanges = (): void => {
  window.clearTimeout(dispatchChangesTimeoutId)
  dispatchChangesTimeoutId = undefined
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

  const __assemble = useAssembler(dispatch)

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
      dispatch(setInterrupt(true))
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
    if (fault !== null || halted) {
      stopIfRunning(state)
      if (fault === null && halted) {
        // trigger EditorState re-render
        dispatch(setCpuHalted(true))
      }
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
          selectSignals(state)
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
      const [memoryData, registers, signals] = stepResultWithSignals
      const instructionAdress = registers.ip
      const statement = selectAddressToStatementMap(state)[instructionAdress]
      const hasStatement = statement?.machineCode.every(
        (machineCode, index) => machineCode === memoryData[instructionAdress + index]
      )
      const dispatchChanges = (): void => {
        dispatchChangesTimeoutId = window.setTimeout(() => {
          batch(() => {
            dispatch(setMemoryData(memoryData))
            dispatch(setCpuRegisters(registers))
            dispatch(hasStatement ? setEditorActiveRange(statement) : clearEditorActiveRange())
          })
          dispatchChangesTimeoutId = undefined
        })
      }
      let willDispatchChanges = false
      if (dispatchChangesTimeoutId === undefined) {
        willDispatchChanges = true
        dispatchChanges()
      }
      const { data: inputData, interrupt } = signals.input
      // TODO: handle output data
      const { requiredInputDataPort, halted: shouldHalt = false } = signals.output
      if (interrupt) {
        dispatch(setInterrupt(false))
      }
      if (shouldHalt) {
        stopIfRunning(state)
        dispatch(setCpuHalted(true))
        resolve(undefined)
        return
      }
      const isRunning = selectIsRunning(state)
      let willSuspend = false
      if (requiredInputDataPort !== null) {
        if (inputData.content === null) {
          dispatch(setRequiredInputDataPort(requiredInputDataPort))
          willSuspend = true
          if (isRunning) {
            cancelMainLoop()
          }
          batch(() => {
            dispatch(setSuspended(true))
            switch (requiredInputDataPort) {
              case InputPort.SimulatedKeyboard:
                dispatch(setWaitingForKeyboardInput(true))
            }
          })
          removeSetSuspendedListener = addActionListener(setSuspended, async () => {
            removeSetSuspendedListener()
            if (isRunning) {
              setMainLoop()
            }
            await step()
            dispatch(clearRequiredInputDataPort())
          })
        } else {
          dispatch(clearInputData())
        }
      }
      const breakpoints = selectEditorBreakpoints(state)
      if (breakpoints.length > 0 && hasStatement && isRunning && !willSuspend) {
        const { label, range: rangeWithoutLabel } = statement
        const range = {
          from: label === null ? rangeWithoutLabel.from : label.range.from,
          to: rangeWithoutLabel.to
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
      dispatch(clearEditorActiveRange())
    })
  }

  return {
    assemble,
    run,
    step,
    reset
  }
}
