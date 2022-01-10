import { useEffect } from 'react'
// TODO: remove batch from React 18
import { batch } from 'react-redux'
import { RootState, getState, dispatch, listenAction } from '../../app/store'
import { useSelector } from '../../app/hooks'
import {
  selectRuntimeConfiguration,
  selectIsRunning,
  selectIsSuspended,
  setRunning,
  setSuspended
} from './controllerSlice'
import {
  selectEditorBreakpoints,
  setEditorActiveRange,
  clearEditorActiveRange
} from '../editor/editorSlice'
import { lineRangesOverlap } from '../editor/codemirror/line'
import { assembleInputFromState } from '../assembler/assemble'
import {
  selectAddressToStatementMap,
  setAssemblerState,
  resetAssembler
} from '../assembler/assemblerSlice'
import { setMemoryData, resetMemory, selectMemoryData } from '../memory/memorySlice'
import { StepResult, RuntimeError, step as __step } from '../cpu/core'
import {
  selectCpuStatus,
  selectCpuRegisters,
  setCpuFault,
  setCpuHalted,
  setCpuRegisters,
  resetCpu
} from '../cpu/cpuSlice'
import { InputPort, OutputPort } from '../io/core'
import {
  selectInputSignals,
  selectIsWaitingForInput,
  clearInputData,
  setInterrupt,
  setWaitingForInput,
  setWaitingForKeyboardInput,
  setTrafficLightsData,
  resetIo
} from '../io/ioSlice'

// they must be assigned in `setMainLoop` when they are read in `cancelMainLoop`
let stepIntervalId: number
let interruptIntervalId: number

const cancelMainLoop = (): void => {
  window.clearInterval(stepIntervalId)
  window.clearInterval(interruptIntervalId)
}

const stop = (): void => {
  cancelMainLoop()
  dispatch(setRunning(false))
}

/**
 * @returns {boolean} if was running
 */
const stopIfRunning = (state: RootState): boolean => {
  const isRunning = selectIsRunning(state)
  if (isRunning) {
    stop()
  }
  return isRunning
}

// it must be assigned in `step` when it is called in `restoreIfSuspended`
let unsubscribeSetSuspended: () => void

/**
 * @returns {boolean} if was suspended
 */
const restoreIfSuspended = (state: RootState): boolean => {
  const isSuspended = selectIsSuspended(state)
  if (isSuspended) {
    unsubscribeSetSuspended()
    dispatch(setSuspended(false))
  }
  return isSuspended
}

let lastStep: Promise<StepResult | undefined> = Promise.resolve(undefined)

let dispatchChangesTimeoutId: number | undefined

const cancelDispatchChanges = (): void => {
  window.clearTimeout(dispatchChangesTimeoutId)
  dispatchChangesTimeoutId = undefined
}

const fullyStop = async (): Promise<void> => {
  const state = getState()
  stopIfRunning(state)
  restoreIfSuspended(state)
  await lastStep
  lastStep = Promise.resolve(undefined)
  cancelDispatchChanges()
}

const reset = async (): Promise<void> => {
  await fullyStop()
  batch(() => {
    dispatch(resetMemory())
    dispatch(resetCpu())
    dispatch(resetAssembler())
    dispatch(clearEditorActiveRange())
    dispatch(resetIo())
  })
}

interface Controller {
  assemble: () => void
  run: () => void
  step: () => Promise<void>
  reset: () => Promise<void>
}

export const useController = (): Controller => {
  const { clockSpeed, timerInterval } = useSelector(selectRuntimeConfiguration)

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

  /**
   * or stop if running
   */
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
        // trigger EditorStatus re-render
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
          {
            input: selectInputSignals(state),
            output: {}
          }
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
      const { requiredInputDataPort, data: outputData, halted: shouldHalt = false } = signals.output
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
      if (requiredInputDataPort !== undefined) {
        dispatch(setWaitingForInput(true))
        if (inputData.content === null) {
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
          // TODO: add option `once`
          unsubscribeSetSuspended = listenAction(setSuspended, () => {
            unsubscribeSetSuspended()
            if (isRunning) {
              setMainLoop()
            }
            void step()
          })
        } else {
          // wrong port
          dispatch(clearInputData())
        }
      } else if (selectIsWaitingForInput(state)) {
        // step() called from actionListener
        dispatch(setWaitingForInput(false))
        dispatch(clearInputData())
      }
      if (outputData?.content !== undefined) {
        const { content: outputDataContent, port: outputDataPort } = outputData
        switch (outputDataPort) {
          case OutputPort.TrafficLights:
            dispatch(setTrafficLightsData(outputDataContent))
        }
      }
      const breakpoints = selectEditorBreakpoints(state)
      if (breakpoints.length > 0 && hasStatement && isRunning && !willSuspend) {
        const { label, range: rangeWithoutLabel } = statement
        const statementRange = {
          from: label === null ? rangeWithoutLabel.from : label.range.from,
          to: rangeWithoutLabel.to
        }
        const willBreak = breakpoints.some(lineRange =>
          lineRangesOverlap(lineRange, statementRange)
        )
        if (willBreak) {
          if (!willDispatchChanges) {
            dispatchChanges()
          }
          // isRunning is already checked
          stop()
        }
      }
      resolve([memoryData, registers])
    })
  }

  useEffect(() => listenAction(setAssemblerState, fullyStop), [])

  return {
    assemble: assembleInputFromState,
    run,
    step,
    reset
  }
}
