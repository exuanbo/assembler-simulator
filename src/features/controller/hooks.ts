import store from '../../app/store'
import { useAppDispatch } from '../../app/hooks'
import { setData as setMemoryData, selectMemoryData } from '../memory/memorySlice'
import {
  setFault,
  setHalted,
  setRegisters,
  selectStatus,
  selectRegisters,
  selectInputSignals
} from '../cpu/cpuSlice'
import { step } from '../cpu/core'
import { RuntimeError } from '../../common/exceptions'

let lastJob: Promise<void> = Promise.resolve()

interface Controller {
  step: () => Promise<void>
}

export const useController = (): Controller => {
  const dispatch = useAppDispatch()

  const __step = async (): Promise<void> => {
    await lastJob
    lastJob = new Promise((resolve, reject) => {
      const state = store.getState()
      const { fault, halted } = selectStatus(state)
      if (fault) {
        // TODO: handle fault
      }
      if (halted) {
        // TODO: handle halted
      }
      try {
        const [memoryData, registers, outputSignals] = step(
          selectMemoryData(state),
          selectRegisters(state),
          selectInputSignals(state)
        )
        dispatch(setMemoryData(memoryData))
        dispatch(setRegisters(registers))
        // TODO: handle output
        const { halted = false } = outputSignals
        if (halted) {
          dispatch(setHalted(true))
        }
      } catch (err) {
        if (err instanceof RuntimeError) {
          dispatch(setFault(true))
        }
        // TODO: handle exceptions
      }
      resolve()
    })
  }

  return {
    step: __step
  }
}
