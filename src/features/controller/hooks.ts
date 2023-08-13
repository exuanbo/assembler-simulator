import { useEffect } from 'react'
import { debounceTime, filter, first } from 'rxjs'
import type { RootStateSelector, Store } from '@/app/store'
import { subscribe } from '@/app/subscribe'
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
  setEditorHighlightRange,
  clearEditorHighlightRange,
  setEditorMessage
} from '@/features/editor/editorSlice'
import { lineRangesOverlap } from '@/features/editor/codemirror/text'
import { createAssemble } from '@/features/assembler/assemble'
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
  private readonly store: Store
  private readonly applySelector: <T>(selector: RootStateSelector<T>) => T

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

  constructor(store: Store) {
    this.store = store
    this.applySelector = selector => selector(store.getState())
  }

  public assemble = (): void => {
    const assembleFrom = createAssemble(this.store)
    assembleFrom(this.applySelector(selectEditorInput))
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
    const isRunning = this.applySelector(selectIsRunning)
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
    this.store.dispatch(setRunning(false))
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
    this.store.dispatch(setRunning(true))
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
    const { clockSpeed } = this.applySelector(selectRuntimeConfiguration)
    this.stepIntervalId = window.setInterval(this.step, 1000 / clockSpeed)
  }

  private setInterruptInterval(withFlag = true): void {
    const { timerInterval } = this.applySelector(selectRuntimeConfiguration)
    this.interruptIntervalId = window.setInterval(() => {
      this.store.dispatch(setInterrupt(true))
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
      this.store.dispatch(setInterrupt(false))
    }
    if (this.applySelector(selectEditorInput) !== this.applySelector(selectAssembledSource)) {
      this.store.dispatch(setEditorMessage(sourceChangedMessage))
    }
    const { fault, halted } = this.applySelector(selectCpuStatus)
    if (fault !== null || halted) {
      this.stopIfRunning()
      if (fault === null && halted) {
        // trigger `EditorMessage` re-render
        this.store.dispatch(setCpuHalted())
      }
      return
    }
    this.lastStep = new Promise(resolve => {
      let stepOutput: StepOutput
      try {
        stepOutput = stepPure(
          lastStepResult ?? {
            memoryData: this.applySelector(selectMemoryData),
            cpuRegisters: this.applySelector(selectCpuRegisters)
          },
          this.applySelector(selectInputSignals)
        )
      } catch (exception) {
        this.stopIfRunning()
        if (exception instanceof RuntimeError) {
          const runtimeErrorObject = exception.toPlainObject()
          this.store.dispatch(setCpuFault(runtimeErrorObject))
        } else {
          this.store.dispatch(setException(exception))
        }
        resolve(undefined)
        return
      }
      const { memoryData, cpuRegisters, signals, changes } = stepOutput
      const instructionAdress = cpuRegisters.ip
      const addressToStatementMap = this.applySelector(selectAddressToStatementMap)
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
          this.store.dispatch(setMemoryData(memoryData))
          if (isVduBufferChanged) {
            this.store.dispatch(setVduDataFrom(memoryData))
          }
          this.store.dispatch(setCpuRegisters(cpuRegisters))
          if (hasStatement) {
            this.store.dispatch(setEditorHighlightRange(statement))
          } else {
            this.store.dispatch(clearEditorHighlightRange())
          }
          this.dispatchChangesTimeoutId = undefined
        })
      }
      if (!this.willDispatchChanges || isVduBufferChanged) {
        dispatchChanges()
      }
      const isRunning = this.applySelector(selectIsRunning)
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
        this.store.dispatch(setInterrupt(false))
      }
      if (signals.output.halted === true) {
        this.stopIfRunning()
        this.store.dispatch(setCpuHalted())
        resolve(undefined)
        return
      }
      if (signals.output.closeWindows === true) {
        this.store.dispatch(setIoDevicesInvisible())
      }
      let willSuspend = false
      if (expectedInputPort !== undefined) {
        this.store.dispatch(setWaitingForInput(true))
        if (inputData.content === null) {
          willSuspend = true
          if (isRunning) {
            this.pauseMainLoop()
          }
          this.store.dispatch(setSuspended(true))
          switch (expectedInputPort) {
            case InputPort.SimulatedKeyboard:
              this.store.dispatch(setWaitingForKeyboardInput(true))
              break
          }
          this.unsubscribeSetSuspended = subscribe(
            this.store.onAction(setSuspended).pipe(first()),
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
          this.store.dispatch(clearInputData())
        }
      } else if (this.applySelector(selectIsWaitingForInput)) {
        // `step` called from actionListener
        this.store.dispatch(setWaitingForInput(false))
        this.store.dispatch(clearInputData())
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
          this.store.dispatch(
            setIoDeviceData({
              name: ioDeviceName,
              data: outputDataContent
            })
          )
        }
      }
      let hasBreakpoint = false
      const breakpoints = this.applySelector(selectEditorBreakpoints)
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
    this.store.dispatch(resetMemoryData())
    this.store.dispatch(resetCpuState())
    this.store.dispatch(resetAssemblerState())
    this.store.dispatch(clearEditorHighlightRange())
    this.store.dispatch(resetIoState())
  }

  public resetSelf = (): void => {
    this.stopIfRunning()
    this.restoreIfSuspended()
    this.cancelDispatchChanges()
    this.resetBreakpointLineNumber()
    this.resetLastStep()
  }

  private restoreIfSuspended(): void {
    if (this.applySelector(selectIsSuspended)) {
      this.unsubscribeSetSuspended!()
      this.unsubscribeSetSuspended = undefined
      this.store.dispatch(setSuspended(false))
    }
  }

  private resetLastStep(): void {
    this.lastStep = Promise.resolve(undefined)
  }
}

export const useController = (): Controller => {
  const store = useStore()
  const controller = useSingleton(() => new Controller(store))

  useEffect(() => {
    return subscribe(store.onAction(setEditorInput), controller.resetSelf)
  }, [])

  useEffect(() => {
    return subscribe(
      store.onAction(setAutoAssemble).pipe(
        debounceTime(UPDATE_TIMEOUT_MS),
        filter(shouldAutoAssemble => shouldAutoAssemble && !selectIsAssembled(store.getState()))
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
          const state = store.getState()
          // `setSuspended` action listener will resume the main loop with new configuration
          // so we skip calling `stopAndRun` if cpu is suspended
          return selectIsRunning(state) && !selectIsSuspended(state)
        })
      ),
      controller.stopAndRun
    )
  }, [])

  return controller
}
