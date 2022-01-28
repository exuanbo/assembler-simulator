import { useEffect } from 'react'
// TODO: remove batch from React 18
import { batch } from 'react-redux'
import { RootState, getState, dispatch, listenAction, watch } from '@/app/store'
import {
  selectRuntimeConfiguration,
  selectIsRunning,
  selectIsSuspended,
  setRunning,
  setSuspended
} from './controllerSlice'
import {
  selectEditorBreakpoints,
  setEditorInput,
  setEditorActiveRange,
  clearEditorActiveRange
} from '@/features/editor/editorSlice'
import { lineRangesOverlap } from '@/features/editor/codemirror/line'
import { assembleInputFromState } from '@/features/assembler/assemble'
import {
  selectAddressToStatementMap,
  setAssemblerState,
  resetAssembler
} from '@/features/assembler/assemblerSlice'
import { VDU_START_ADDRESS } from '@/features/memory/core'
import { setMemoryData, resetMemoryData, selectMemoryData } from '@/features/memory/memorySlice'
import { StepResult, RuntimeError, step as __step } from '@/features/cpu/core'
import {
  selectCpuStatus,
  selectCpuRegisters,
  setCpuFault,
  setCpuHalted,
  setCpuRegisters,
  resetCpu
} from '@/features/cpu/cpuSlice'
import { InputPort, OutputPort } from '@/features/io/core'
import {
  IoDeviceName,
  selectInputSignals,
  selectIsWaitingForInput,
  clearInputData,
  setInterrupt,
  setWaitingForInput,
  setWaitingForKeyboardInput,
  setVduDataFrom,
  setIoDeviceData,
  resetIo
} from '@/features/io/ioSlice'
import { useConstant } from '@/common/hooks'
import { call } from '@/common/utils'

class Controller {
  // they must have been assigned in `setMainLoop` when they are read in `cancelMainLoop`
  private stepIntervalId!: number
  private interruptIntervalId!: number

  private lastStep: Promise<StepResult | undefined> = Promise.resolve(undefined)

  private dispatchChangesTimeoutId: number | undefined

  // it must have been assigned in `step` when it is called in `restoreIfSuspended`
  private unsubscribeSetSuspended!: () => void

  public assemble = assembleInputFromState

  public runOrStop = async (): Promise<void> => {
    const state = getState()
    if (this.stopIfRunning(state)) {
      this.restoreIfSuspended(state)
      return
    }
    if (selectIsSuspended(state)) {
      return
    }
    await this.run()
  }

  public async stopAndRun(): Promise<void> {
    this.cancelMainLoop()
    await this.lastStep
    this.setMainLoop()
    await this.step()
  }

  /**
   * @returns true if was running
   */
  private stopIfRunning(state: RootState): boolean {
    const isRunning = selectIsRunning(state)
    if (isRunning) {
      this.stop()
    }
    return isRunning
  }

  private stop(): void {
    this.cancelMainLoop()
    dispatch(setRunning(false))
  }

  private cancelMainLoop(): void {
    window.clearInterval(this.stepIntervalId)
    window.clearInterval(this.interruptIntervalId)
  }

  /**
   * @returns true if was suspended
   */
  private restoreIfSuspended(state: RootState): boolean {
    const isSuspended = selectIsSuspended(state)
    if (isSuspended) {
      this.unsubscribeSetSuspended()
      dispatch(setSuspended(false))
    }
    return isSuspended
  }

  private async run(): Promise<void> {
    dispatch(setRunning(true))
    this.setMainLoop()
    await this.step()
  }

  private setMainLoop(): void {
    const { clockSpeed, timerInterval } = selectRuntimeConfiguration(getState())
    this.stepIntervalId = window.setInterval(this.step, 1000 / clockSpeed)
    this.interruptIntervalId = window.setInterval(() => {
      dispatch(setInterrupt(true))
    }, timerInterval)
  }

  public step = async (): Promise<void> => {
    const lastStepResult = await this.lastStep
    const state = getState()
    const { fault, halted } = selectCpuStatus(state)
    if (fault !== null || halted) {
      this.stopIfRunning(state)
      if (fault === null && halted) {
        // trigger EditorStatus re-render
        dispatch(setCpuHalted())
      }
      return
    }
    if (selectIsSuspended(state)) {
      return
    }
    this.lastStep = new Promise(resolve => {
      let stepResultWithSignals: ReturnType<typeof __step>
      try {
        stepResultWithSignals = __step(
          lastStepResult ?? {
            memoryData: selectMemoryData(state),
            cpuRegisters: selectCpuRegisters(state)
          },
          selectInputSignals(state)
        )
      } catch (err) {
        this.stopIfRunning(state)
        if (err instanceof RuntimeError) {
          dispatch(setCpuFault(err.message))
          resolve(undefined)
          return
        }
        resolve(undefined)
        // TODO: handle unexpected runtime errors
        throw err
      }
      const { memoryData, cpuRegisters, signals, changes } = stepResultWithSignals
      const instructionAdress = cpuRegisters.ip
      const statement = selectAddressToStatementMap(state)[instructionAdress]
      const hasStatement = statement?.machineCode.every(
        (machineCode, index) => machineCode === memoryData[instructionAdress + index]
      )
      let isVduBufferChanged = false
      if (changes.memoryData !== undefined) {
        const { address: addressChanged } = changes.memoryData
        if (addressChanged >= VDU_START_ADDRESS) {
          isVduBufferChanged = true
        }
      }
      const dispatchChanges = (): void => {
        this.dispatchChangesTimeoutId = window.setTimeout(() => {
          batch(() => {
            dispatch(setMemoryData(memoryData))
            if (isVduBufferChanged) {
              dispatch(setVduDataFrom(memoryData))
            }
            dispatch(setCpuRegisters(cpuRegisters))
            dispatch(hasStatement ? setEditorActiveRange(statement) : clearEditorActiveRange())
          })
          this.dispatchChangesTimeoutId = undefined
        })
      }
      let willDispatchChanges = false
      if (this.dispatchChangesTimeoutId === undefined || isVduBufferChanged) {
        willDispatchChanges = true
        dispatchChanges()
      }
      const { data: inputData, interrupt } = signals.input
      const { requiredInputDataPort, data: outputData, halted: shouldHalt = false } = signals.output
      if (interrupt) {
        dispatch(setInterrupt(false))
      }
      if (shouldHalt) {
        this.stopIfRunning(state)
        dispatch(setCpuHalted())
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
            this.cancelMainLoop()
          }
          batch(() => {
            dispatch(setSuspended(true))
            switch (requiredInputDataPort) {
              case InputPort.SimulatedKeyboard:
                dispatch(setWaitingForKeyboardInput(true))
                break
            }
          })
          this.unsubscribeSetSuspended = listenAction(
            setSuspended,
            async () => {
              if (isRunning) {
                this.setMainLoop()
              }
              await this.step()
            },
            { once: true }
          )
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
        // TODO: extract function
        const ioDeviceName = call(() => {
          switch (outputDataPort) {
            case OutputPort.TrafficLights:
              return IoDeviceName.TrafficLights
            case OutputPort.SevenSegmentDisplay:
              return IoDeviceName.SevenSegmentDisplay
          }
        })
        if (ioDeviceName !== undefined) {
          dispatch(
            setIoDeviceData({
              name: ioDeviceName,
              data: outputDataContent
            })
          )
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
          this.stop()
        }
      }
      resolve({ memoryData, cpuRegisters })
    })
  }

  public reset = async (): Promise<void> => {
    await this.fullyStop()
    batch(() => {
      dispatch(resetMemoryData())
      dispatch(resetCpu())
      dispatch(resetAssembler())
      dispatch(clearEditorActiveRange())
      dispatch(resetIo())
    })
  }

  public fullyStop = async (): Promise<void> => {
    const state = getState()
    this.stopIfRunning(state)
    this.restoreIfSuspended(state)
    await this.resetLastStep()
    this.cancelDispatchChanges()
  }

  private async resetLastStep(): Promise<void> {
    await this.lastStep
    this.lastStep = Promise.resolve(undefined)
  }

  private cancelDispatchChanges(): void {
    if (this.dispatchChangesTimeoutId !== undefined) {
      window.clearTimeout(this.dispatchChangesTimeoutId)
      this.dispatchChangesTimeoutId = undefined
    }
  }
}

export const useController = (): Controller => {
  const controller = useConstant(() => new Controller())

  useEffect(() => {
    return watch(selectRuntimeConfiguration, async (_, { getState }) => {
      const state = getState()
      // `setSuspended` action listener will reset the main loop
      if (!selectIsSuspended(state) && selectIsRunning(state)) {
        await controller.stopAndRun()
      }
    })
  }, [])

  useEffect(() => {
    return listenAction(setEditorInput, controller.fullyStop)
  }, [])

  useEffect(() => {
    return listenAction(setAssemblerState, controller.fullyStop)
  }, [])

  return controller
}
