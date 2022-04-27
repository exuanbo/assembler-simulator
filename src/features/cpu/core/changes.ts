import type { Registers } from './index'
import type { RegisterName } from './constants'

interface Change {
  // TODO: { from: number, to: number }
  value: number
}

export interface RegisterChange extends Change {
  name?: RegisterName
}

type RegisterChanges = {
  [name in keyof Registers]?: RegisterChange
}

export interface MemoryDataChange extends Change {
  address: number
}

export interface StepChanges {
  cpuRegisters: RegisterChanges
  memoryData?: MemoryDataChange
}
