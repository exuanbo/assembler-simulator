import { useEffect } from 'react'
import { debounceTime, filter, first } from 'rxjs'

import { applySelector } from '@/app/selector'
import { store } from '@/app/store'
import { subscribe } from '@/app/subscribe'
import { UPDATE_TIMEOUT_MS } from '@/common/constants'
import { useSingleton } from '@/common/hooks'
import { call } from '@/common/utils'
import { assemble as assembleFrom } from '@/features/assembler/assemble'
import {
  resetAssemblerState,
  selectAddressToStatementMap,
  selectAssembledSource,
  selectIsAssembled,
  setAssemblerState,
} from '@/features/assembler/assemblerSlice'
import {
  __getSrInterruptFlag,
  RuntimeError,
  step as stepPure,
  StepOutput,
  StepResult,
} from '@/features/cpu/core'
import {
  resetCpuState,
  selectCpuRegisters,
  selectCpuStatus,
  setCpuFault,
  setCpuHalted,
  setCpuRegisters,
} from '@/features/cpu/cpuSlice'
import { lineRangesOverlap } from '@/features/editor/codemirror/text'
import {
  clearEditorHighlightRange,
  EditorMessage,
  MessageType,
  selectEditorBreakpoints,
  selectEditorInput,
  setEditorHighlightRange,
  setEditorInput,
  setEditorMessage,
} from '@/features/editor/editorSlice'
import { setException } from '@/features/exception/exceptionSlice'
import { InputPort, OutputPort } from '@/features/io/core'
import {
  clearInputData,
  IoDeviceName,
  resetIoState,
  selectInputSignals,
  selectIsWaitingForInput,
  setInterrupt,
  setIoDeviceData,
  setIoDevicesInvisible,
  setVduDataFrom,
  setWaitingForInput,
  setWaitingForKeyboardInput,
} from '@/features/io/ioSlice'
import { VDU_START_ADDRESS } from '@/features/memory/core'
import { resetMemoryData, selectMemoryData, setMemoryData } from '@/features/memory/memorySlice'

import {
  selectIsRunning,
  selectIsSuspended,
  selectRuntimeConfiguration,
  setAutoAssemble,
  setRunning,
  setSuspended,
} from './controllerSlice'

interface StepOptions {
  isUserAction?: boolean
  lastStepResult?: StepResult | null
}

const sourceChangedMessage: EditorMessage = {
  type: MessageType.Warning,
  content: 'Warning: Source code has changed since last assemble.',
}

class Controller {
  private stepIntervalId?: number

  private interruptIntervalId?: number
  private isInterruptIntervalSet = false

  private lastStep: Promise<StepResult | null> = Promise.resolve(null)

  private dispatchChangesTimeoutId: number | undefined
  private get willDispatchChanges(): boolean {
    return this.dispatchChangesTimeoutId !== undefined
  }

  private unsubscribeSetSuspended: (() => void) | undefined

  private lastBreakpointLineNumber: number | undefined

  public assemble = (): void => {
    assembleFrom(applySelector(selectEditorInput))
  }

  public runOrStop = (): void => {
    if (!this.stopIfRunning()) {
      void this.run()
    }
  }

  /**
   * @returns true if stopped from running
   */
  private stopIfRunning(): boolean {
    const isRunning = applySelector(selectIsRunning)
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
    store.dispatch(setRunning(false))
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

  private async run(): Promise<void> {
    store.dispatch(setRunning(true))
    this.setStepInterval()
    const lastStepResult = await this.lastStep
    if (lastStepResult !== null) {
      const isSrInterruptFlagSet = __getSrInterruptFlag(lastStepResult.cpuRegisters.sr)
      if (isSrInterruptFlagSet) {
        this.setInterruptInterval()
      }
    }
    await this.stepAsync({ isUserAction: true, lastStepResult })
  }

  private setStepInterval(): void {
    const { clockSpeed } = applySelector(selectRuntimeConfiguration)
    this.stepIntervalId = window.setInterval(this.step, 1000 / clockSpeed)
  }

  private setInterruptInterval(withFlag = true): void {
    const { timerInterval } = applySelector(selectRuntimeConfiguration)
    this.interruptIntervalId = window.setInterval(() => {
      store.dispatch(setInterrupt(true))
    }, timerInterval)
    if (withFlag) {
      this.isInterruptIntervalSet = true
    }
  }

  public stopAndRun = (): void => {
    this.pauseMainLoop()
    this.resumeMainLoop()
    this.step()
  }

  private pauseMainLoop(): void {
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

  public step = (options: StepOptions = {}): void => {
    void this.stepAsync(options)
  }

  private stepAsync = async ({ isUserAction, lastStepResult }: StepOptions): Promise<void> => {
    if (lastStepResult === undefined) {
      lastStepResult = await this.lastStep
    }
    if (isUserAction) {
      store.dispatch(setInterrupt(false))
    }
    this.stepFrom(lastStepResult)
  }

  private stepFrom = (lastStepResult: StepResult | null): void => {
    if (applySelector(selectEditorInput) !== applySelector(selectAssembledSource)) {
      store.dispatch(setEditorMessage(sourceChangedMessage))
    }
    const { fault, halted } = applySelector(selectCpuStatus)
    if (fault !== null || halted) {
      this.stopIfRunning()
      if (fault === null && halted) {
        // trigger `EditorMessage` re-render
        store.dispatch(setCpuHalted())
      }
      return
    }
    this.lastStep = new Promise((resolve) => {
      let stepOutput: StepOutput
      try {
        stepOutput = stepPure(
          lastStepResult ?? {
            memoryData: applySelector(selectMemoryData),
            cpuRegisters: applySelector(selectCpuRegisters),
          },
          applySelector(selectInputSignals),
        )
      } catch (exception) {
        this.stopIfRunning()
        if (exception instanceof RuntimeError) {
          const runtimeErrorObject = exception.toPlainObject()
          store.dispatch(setCpuFault(runtimeErrorObject))
        } else {
          store.dispatch(setException(exception))
        }
        resolve(null)
        return
      }
      const { memoryData, cpuRegisters, signals, changes } = stepOutput
      const instructionAdress = cpuRegisters.ip
      const addressToStatementMap = applySelector(selectAddressToStatementMap)
      const statement = addressToStatementMap[instructionAdress]
      const hasStatement =
        statement !== undefined &&
        statement.machineCodes.length > 0 &&
        statement.machineCodes.every(
          (machineCode, machineCodeIndex) =>
            machineCode === memoryData[instructionAdress + machineCodeIndex],
        )
      const changeAddress = changes.memoryData?.address
      const isVduBufferChanged = changeAddress !== undefined && changeAddress >= VDU_START_ADDRESS
      const dispatchChanges = (): void => {
        this.cancelDispatchChanges()
        this.dispatchChangesTimeoutId = window.setTimeout(() => {
          store.dispatch(setMemoryData(memoryData))
          if (isVduBufferChanged) {
            store.dispatch(setVduDataFrom(memoryData))
          }
          store.dispatch(setCpuRegisters(cpuRegisters))
          if (hasStatement) {
            store.dispatch(setEditorHighlightRange(statement))
          } else {
            store.dispatch(clearEditorHighlightRange())
          }
          this.dispatchChangesTimeoutId = undefined
        })
      }
      if (!this.willDispatchChanges || isVduBufferChanged) {
        dispatchChanges()
      }
      const isRunning = applySelector(selectIsRunning)
      if (isRunning) {
        const isSrInterruptFlagChanged = changes.cpuRegisters?.sr?.interrupt ?? false
        if (isSrInterruptFlagChanged) {
          const isSrInterruptFlagSet = __getSrInterruptFlag(cpuRegisters.sr)
          if (isSrInterruptFlagSet) {
            if (!this.isInterruptIntervalSet) {
              this.setInterruptInterval()
            }
          } else {
            if (this.isInterruptIntervalSet) {
              this.clearInterruptInterval()
            }
          }
        }
      }
      const { data: inputData } = signals.input
      const { data: outputData, expectedInputPort } = signals.output
      if (signals.input.interrupt) {
        store.dispatch(setInterrupt(false))
      }
      if (signals.output.halted === true) {
        this.stopIfRunning()
        store.dispatch(setCpuHalted())
        resolve(null)
        return
      }
      if (signals.output.closeWindows === true) {
        store.dispatch(setIoDevicesInvisible())
      }
      let willSuspend = false
      if (expectedInputPort !== undefined) {
        store.dispatch(setWaitingForInput(true))
        if (inputData.content === null) {
          willSuspend = true
          if (isRunning) {
            this.pauseMainLoop()
          }
          store.dispatch(setSuspended(true))
          switch (expectedInputPort) {
            case InputPort.SimulatedKeyboard:
              store.dispatch(setWaitingForKeyboardInput(true))
              break
          }
          this.unsubscribeSetSuspended = subscribe(
            store.onAction(setSuspended).pipe(first()),
            // payload must be false
            () => {
              this.unsubscribeSetSuspended = undefined
              // state cannot be changed when suspended
              if (isRunning) {
                this.resumeMainLoop()
              }
              this.step()
            },
          )
        } else {
          // wrong port
          store.dispatch(clearInputData())
        }
      } else if (applySelector(selectIsWaitingForInput)) {
        // `step` called from actionListener
        store.dispatch(setWaitingForInput(false))
        store.dispatch(clearInputData())
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
          store.dispatch(
            setIoDeviceData({
              name: ioDeviceName,
              data: outputDataContent,
            }),
          )
        }
      }
      let hasBreakpoint = false
      const breakpoints = applySelector(selectEditorBreakpoints)
      if (breakpoints.length > 0 && hasStatement && isRunning && !willSuspend) {
        const breakpointLineLoc = breakpoints.find((lineLoc) =>
          lineRangesOverlap(lineLoc, statement.range),
        )
        if (breakpointLineLoc !== undefined) {
          hasBreakpoint = true
          if (breakpointLineLoc.number !== this.lastBreakpointLineNumber) {
            if (!this.willDispatchChanges) {
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

  private cancelDispatchChanges(): void {
    if (this.dispatchChangesTimeoutId !== undefined) {
      window.clearTimeout(this.dispatchChangesTimeoutId)
      this.dispatchChangesTimeoutId = undefined
    }
  }

  private resetBreakpointLineNumber(): void {
    this.lastBreakpointLineNumber = undefined
  }

  public reset = (): void => {
    this.resetSelf()
    store.dispatch(resetMemoryData())
    store.dispatch(resetCpuState())
    store.dispatch(resetAssemblerState())
    store.dispatch(clearEditorHighlightRange())
    store.dispatch(resetIoState())
  }

  public resetSelf = (): void => {
    this.stopIfRunning()
    this.restoreIfSuspended()
    this.cancelDispatchChanges()
    this.resetBreakpointLineNumber()
    this.resetLastStep()
  }

  private restoreIfSuspended(): void {
    if (applySelector(selectIsSuspended)) {
      this.unsubscribeSetSuspended!()
      this.unsubscribeSetSuspended = undefined
      store.dispatch(setSuspended(false))
    }
  }

  private resetLastStep(): void {
    this.lastStep = Promise.resolve(null)
  }
}

export const useController = (): Controller => {
  const controller = useSingleton(() => new Controller())

  useEffect(() => {
    return subscribe(store.onAction(setEditorInput), controller.resetSelf)
  }, [])

  useEffect(() => {
    return subscribe(
      store.onAction(setAutoAssemble).pipe(
        debounceTime(UPDATE_TIMEOUT_MS),
        filter((shouldAutoAssemble) => shouldAutoAssemble && !applySelector(selectIsAssembled)),
      ),
      controller.assemble,
    )
  }, [])

  useEffect(() => {
    return subscribe(store.onAction(setAssemblerState), controller.resetSelf)
  }, [])

  useEffect(() => {
    return subscribe(
      store.onState(selectRuntimeConfiguration).pipe(
        filter(() => {
          // `setSuspended` action listener will resume the main loop with new configuration
          // so we skip calling `stopAndRun` if cpu is suspended
          return applySelector(selectIsRunning) && !applySelector(selectIsSuspended)
        }),
      ),
      controller.stopAndRun,
    )
  }, [])

  return controller
}
