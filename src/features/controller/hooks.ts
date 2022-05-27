import { useEffect } from 'react'
import type { RootState, Store, StoreGetState, StoreDispatch } from '@/app/store'
import { listenAction } from '@/app/actionListener'
import { watch } from '@/app/watcher'
import { useStore } from '@/app/hooks'
import {
  selectRuntimeConfiguration,
  selectIsRunning,
  selectIsSuspended,
  setAutoAssemble,
  setRunning,
  setSuspended
} from './controllerSlice'
import {
  MessageType,
  EditorMessage,
  selectEditorInput,
  selectEditorBreakpoints,
  setEditorInput,
  setEditorActiveRange,
  clearEditorActiveRange,
  setEditorMessage
} from '@/features/editor/editorSlice'
import { lineRangesOverlap } from '@/features/editor/codemirror/text'
import { createAssemble } from '@/features/assembler/assemble'
import {
  selectAssembledSource,
  selectAddressToStatementMap,
  setAssemblerState,
  resetAssemblerState
} from '@/features/assembler/assemblerSlice'
import { VDU_START_ADDRESS } from '@/features/memory/core'
import { setMemoryData, resetMemoryData, selectMemoryData } from '@/features/memory/memorySlice'
import {
  RuntimeError,
  Flag,
  StepResult,
  StepOutput,
  getFlagFrom,
  step as __step
} from '@/features/cpu/core'
import {
  selectCpuStatus,
  selectCpuRegisters,
  setCpuFault,
  setCpuHalted,
  setCpuRegisters,
  resetCpuState
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
  setIoDevicesInvisible,
  resetIoState
} from '@/features/io/ioSlice'
import { setException } from '@/features/exception/exceptionSlice'
import { useConstant } from '@/common/hooks'
import { call, errorToPlainObject } from '@/common/utils'
import { UPDATE_TIMEOUT_MS } from '@/common/constants'

const sourceChangedMessage: EditorMessage = {
  type: MessageType.Warning,
  content: 'Warning: Source code has changed since last assemble.'
}

class Controller {
  private readonly getState: StoreGetState
  private readonly dispatch: StoreDispatch

  private stepIntervalId!: number

  private interruptIntervalId!: number
  private isInterruptIntervalSet = false

  private lastStep: Promise<StepResult | undefined> = Promise.resolve(undefined)

  private dispatchChangesTimeoutId: number | undefined

  // It must have been assigned in `step` when it is called in `restoreIfSuspended`.
  private unsubscribeSetSuspended!: () => void

  private lastBreakpointLineNumber: number | undefined

  constructor(store: Store) {
    this.getState = store.getState
    this.dispatch = store.dispatch
    const __assemble = createAssemble(store)
    this.assemble = () => __assemble()
  }

  public assemble: () => void

  public runOrStop = async (): Promise<void> => {
    if (!this.stopIfRunning(this.getState())) {
      await this.run()
    }
  }

  /**
   * @returns true if stopped from running
   */
  private stopIfRunning(state: RootState): boolean {
    const isRunning = selectIsRunning(state)
    if (isRunning) {
      this.stop()
    }
    return isRunning
  }

  private stop(): void {
    this.clearStepInterval()
    if (this.isInterruptIntervalSet) {
      this.clearInterruptInterval()
    }
    this.dispatch(setRunning(false))
  }

  private clearStepInterval(): void {
    window.clearInterval(this.stepIntervalId)
  }

  private clearInterruptInterval(withFlag = true): void {
    window.clearInterval(this.interruptIntervalId)
    if (withFlag) {
      this.isInterruptIntervalSet = false
    }
  }

  private restoreIfSuspended(state: RootState): void {
    if (selectIsSuspended(state)) {
      this.unsubscribeSetSuspended()
      this.dispatch(setSuspended(false))
    }
  }

  private async run(): Promise<void> {
    this.dispatch(setRunning(true))
    this.setStepInterval()
    await this.step()
  }

  private setStepInterval(): void {
    const { clockSpeed } = selectRuntimeConfiguration(this.getState())
    this.stepIntervalId = window.setInterval(this.step, 1000 / clockSpeed)
  }

  public stopAndRun = async (): Promise<void> => {
    this.cancelMainLoop()
    this.resumeMainLoop()
    await this.step()
  }

  private cancelMainLoop(): void {
    this.clearStepInterval()
    if (this.isInterruptIntervalSet) {
      this.clearInterruptInterval(/* withFlag: */ false)
    }
  }

  private resumeMainLoop(): void {
    this.setStepInterval()
    if (this.isInterruptIntervalSet) {
      this.setInterruptInterval(/* withFlag: */ false)
    }
  }

  private setInterruptInterval(withFlag = true): void {
    const { timerInterval } = selectRuntimeConfiguration(this.getState())
    this.interruptIntervalId = window.setInterval(() => {
      this.dispatch(setInterrupt(true))
    }, timerInterval)
    if (withFlag) {
      this.isInterruptIntervalSet = true
    }
  }

  public step = async (): Promise<void> => {
    const lastStepResult = await this.lastStep
    const state = this.getState()
    if (selectEditorInput(state) !== selectAssembledSource(state)) {
      this.dispatch(setEditorMessage(sourceChangedMessage))
    }
    const { fault, halted } = selectCpuStatus(state)
    if (fault !== null || halted) {
      this.stopIfRunning(state)
      if (fault === null && halted) {
        // trigger `EditorMessage` re-render
        this.dispatch(setCpuHalted())
      }
      return
    }
    if (selectIsSuspended(state)) {
      return
    }
    this.lastStep = new Promise(resolve => {
      let stepOutput: StepOutput
      try {
        stepOutput = __step(
          lastStepResult ?? {
            memoryData: selectMemoryData(state),
            cpuRegisters: selectCpuRegisters(state)
          },
          selectInputSignals(state)
        )
      } catch (err) {
        this.stopIfRunning(state)
        if (err instanceof RuntimeError) {
          const runtimeError = err.toPlainObject()
          this.dispatch(setCpuFault(runtimeError))
        } else {
          const errorObject = errorToPlainObject(err as Error)
          this.dispatch(setException(errorObject))
        }
        resolve(undefined)
        return
      }
      const { memoryData, cpuRegisters, signals, changes } = stepOutput
      const instructionAdress = cpuRegisters.ip
      const addressToStatementMap = selectAddressToStatementMap(state)
      const statement = addressToStatementMap[instructionAdress] // as Statement | undefined
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
          this.dispatch(setMemoryData(memoryData))
          if (isVduBufferChanged) {
            this.dispatch(setVduDataFrom(memoryData))
          }
          this.dispatch(setCpuRegisters(cpuRegisters))
          this.dispatch(hasStatement ? setEditorActiveRange(statement) : clearEditorActiveRange())
          this.dispatchChangesTimeoutId = undefined
        })
      }
      let willDispatchChanges = false
      if (this.dispatchChangesTimeoutId === undefined || isVduBufferChanged) {
        willDispatchChanges = true
        dispatchChanges()
      }
      const { data: inputData, interrupt } = signals.input
      const {
        halted: shouldHalt = false,
        requiredInputPort,
        data: outputData,
        closeWindows: shouldCloseWindows = false
      } = signals.output
      if (interrupt) {
        this.dispatch(setInterrupt(false))
      }
      if (shouldHalt) {
        this.stopIfRunning(state)
        this.dispatch(setCpuHalted())
        resolve(undefined)
        return
      }
      const isRunning = selectIsRunning(state)
      let willSuspend = false
      if (requiredInputPort !== undefined) {
        this.dispatch(setWaitingForInput(true))
        if (inputData.content === null) {
          willSuspend = true
          if (isRunning) {
            this.cancelMainLoop()
          }
          this.dispatch(setSuspended(true))
          switch (requiredInputPort) {
            case InputPort.SimulatedKeyboard:
              this.dispatch(setWaitingForKeyboardInput(true))
              break
          }
          this.unsubscribeSetSuspended = listenAction(
            setSuspended,
            // payload must be false
            async () => {
              // state cannot be changed when suspended
              if (isRunning) {
                this.resumeMainLoop()
              }
              await this.step()
            },
            { once: true }
          )
        } else {
          // wrong port
          this.dispatch(clearInputData())
        }
      } else if (selectIsWaitingForInput(state)) {
        // `step` called from actionListener
        this.dispatch(setWaitingForInput(false))
        this.dispatch(clearInputData())
      }
      if (outputData?.content !== undefined) {
        const { content: outputDataContent, port: outputPort } = outputData
        const ioDeviceName = call(() => {
          switch (outputPort) {
            case OutputPort.TrafficLights:
              return IoDeviceName.TrafficLights
            case OutputPort.SevenSegmentDisplay:
              return IoDeviceName.SevenSegmentDisplay
          }
        })
        if (ioDeviceName !== undefined) {
          this.dispatch(
            setIoDeviceData({
              name: ioDeviceName,
              data: outputDataContent
            })
          )
        }
      }
      if (isRunning) {
        const isInterruptFlagSet = getFlagFrom(cpuRegisters.sr, Flag.Interrupt)
        const isInterruptFlagChanged = changes.cpuRegisters.sr?.interrupt ?? false
        if (isInterruptFlagChanged) {
          if (isInterruptFlagSet) {
            if (!this.isInterruptIntervalSet) {
              this.setInterruptInterval()
            }
          } else if (this.isInterruptIntervalSet) {
            this.clearInterruptInterval()
          }
        } else if (isInterruptFlagSet && !this.isInterruptIntervalSet) {
          this.setInterruptInterval()
        }
      }
      if (shouldCloseWindows) {
        this.dispatch(setIoDevicesInvisible())
      }
      const breakpoints = selectEditorBreakpoints(state)
      let hasBreakpoint = false
      if (breakpoints.length > 0 && hasStatement && isRunning && !willSuspend) {
        const breakpointLineLoc = breakpoints.find(lineLoc =>
          lineRangesOverlap(lineLoc, statement.range)
        )
        if (breakpointLineLoc !== undefined) {
          hasBreakpoint = true
          if (breakpointLineLoc.number !== this.lastBreakpointLineNumber) {
            if (!willDispatchChanges) {
              dispatchChanges()
            }
            // `isRunning` is already checked
            this.stop()
            this.lastBreakpointLineNumber = breakpointLineLoc.number
          }
        }
      }
      if (!hasBreakpoint && this.lastBreakpointLineNumber !== undefined) {
        this.resetBreakpointLineNumber()
      }
      resolve({ memoryData, cpuRegisters })
    })
  }

  private resetBreakpointLineNumber(): void {
    this.lastBreakpointLineNumber = undefined
  }

  public reset = (): void => {
    this.fullyStop()
    this.dispatch(resetMemoryData())
    this.dispatch(resetCpuState())
    this.dispatch(resetAssemblerState())
    this.dispatch(clearEditorActiveRange())
    this.dispatch(resetIoState())
  }

  public fullyStop = (): void => {
    const state = this.getState()
    this.stopIfRunning(state)
    this.cancelDispatchChanges()
    this.restoreIfSuspended(state)
    this.resetBreakpointLineNumber()
    this.resetLastStep()
  }

  private cancelDispatchChanges(): void {
    if (this.dispatchChangesTimeoutId !== undefined) {
      window.clearTimeout(this.dispatchChangesTimeoutId)
      this.dispatchChangesTimeoutId = undefined
    }
  }

  private resetLastStep(): void {
    this.lastStep = Promise.resolve(undefined)
  }
}

export const useController = (): Controller => {
  const store = useStore()
  const controller = useConstant(() => new Controller(store))

  useEffect(() => {
    return listenAction(setEditorInput, controller.fullyStop)
  }, [])

  useEffect(() => {
    return listenAction(setAutoAssemble, isOn => {
      if (isOn) {
        window.setTimeout(() => {
          controller.assemble()
        }, UPDATE_TIMEOUT_MS)
      }
    })
  }, [])

  useEffect(() => {
    return listenAction(setAssemblerState, controller.fullyStop)
  }, [])

  useEffect(() => {
    return watch(selectRuntimeConfiguration, async (_, api) => {
      const state = api.getState()
      // `setSuspended` action listener will resume the main loop with new configuration
      // so we skip calling `stopAndRun` if cpu is suspended
      if (!selectIsSuspended(state) && selectIsRunning(state)) {
        await controller.stopAndRun()
      }
    })
  }, [])

  return controller
}
