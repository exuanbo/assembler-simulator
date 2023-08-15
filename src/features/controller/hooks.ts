import { useEffect } from 'react'
import { debounceTime, filter, first } from 'rxjs'
import { subscribe } from '@/app/subscribe'
import { store } from '@/app/store'
import { applySelector } from '@/app/selector'
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
  setEditorHighlightRange,
  clearEditorHighlightRange,
  setEditorMessage
} from '@/features/editor/editorSlice'
import { lineRangesOverlap } from '@/features/editor/codemirror/text'
import { assemble as assembleFrom } from '@/features/assembler/assemble'
import {
  selectAssembledSource,
  selectIsAssembled,
  selectAddressToStatementMap,
  setAssemblerState,
  resetAssemblerState
} from '@/features/assembler/assemblerSlice'
import { VDU_START_ADDRESS } from '@/features/memory/core'
import { setMemoryData, resetMemoryData, selectMemoryData } from '@/features/memory/memorySlice'
import {
  RuntimeError,
  StepResult,
  StepOutput,
  __getSrInterruptFlag,
  step as stepPure
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
import { useSingleton } from '@/common/hooks'
import { call } from '@/common/utils'
import { UPDATE_TIMEOUT_MS } from '@/common/constants'

const sourceChangedMessage: EditorMessage = {
  type: MessageType.Warning,
  content: 'Warning: Source code has changed since last assemble.'
}

class Controller {
  private stepIntervalId?: number

  private interruptIntervalId?: number
  private isInterruptIntervalSet = false

  private lastStep: Promise<StepResult | undefined> = Promise.resolve(undefined)

  private dispatchChangesTimeoutId: number | undefined
  private get willDispatchChanges(): boolean {
    return this.dispatchChangesTimeoutId !== undefined
  }

  private unsubscribeSetSuspended: (() => void) | undefined

  private lastBreakpointLineNumber: number | undefined

  public assemble = (): void => {
    assembleFrom(applySelector(selectEditorInput))
  }

  public runOrStop = async (): Promise<void> => {
    if (!this.stopIfRunning()) {
      await this.run()
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
    if (lastStepResult !== undefined) {
      const isSrInterruptFlagSet = __getSrInterruptFlag(lastStepResult.cpuRegisters.sr)
      if (isSrInterruptFlagSet) {
        this.setInterruptInterval()
      }
    }
    await this.step({ isUserAction: true })
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

  public stopAndRun = async (): Promise<void> => {
    this.pauseMainLoop()
    this.resumeMainLoop()
    await this.step()
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

  public step = async ({ isUserAction = false } = {}): Promise<void> => {
    const lastStepResult = await this.lastStep
    if (isUserAction) {
      store.dispatch(setInterrupt(false))
    }
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
    this.lastStep = new Promise(resolve => {
      let stepOutput: StepOutput
      try {
        stepOutput = stepPure(
          lastStepResult ?? {
            memoryData: applySelector(selectMemoryData),
            cpuRegisters: applySelector(selectCpuRegisters)
          },
          applySelector(selectInputSignals)
        )
      } catch (exception) {
        this.stopIfRunning()
        if (exception instanceof RuntimeError) {
          const runtimeErrorObject = exception.toPlainObject()
          store.dispatch(setCpuFault(runtimeErrorObject))
        } else {
          store.dispatch(setException(exception))
        }
        resolve(undefined)
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
            machineCode === memoryData[instructionAdress + machineCodeIndex]
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
        resolve(undefined)
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
            async () => {
              this.unsubscribeSetSuspended = undefined
              // state cannot be changed when suspended
              if (isRunning) {
                this.resumeMainLoop()
              }
              await this.step()
            }
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
              data: outputDataContent
            })
          )
        }
      }
      let hasBreakpoint = false
      const breakpoints = applySelector(selectEditorBreakpoints)
      if (breakpoints.length > 0 && hasStatement && isRunning && !willSuspend) {
        const breakpointLineLoc = breakpoints.find(lineLoc =>
          lineRangesOverlap(lineLoc, statement.range)
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
    this.lastStep = Promise.resolve(undefined)
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
        filter(shouldAutoAssemble => shouldAutoAssemble && !applySelector(selectIsAssembled))
      ),
      controller.assemble
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
        })
      ),
      controller.stopAndRun
    )
  }, [])

  return controller
}
