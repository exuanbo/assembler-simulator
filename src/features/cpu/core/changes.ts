import type { Registers } from './index'

interface Change {
  // TODO: { from: number, to: number }
  value: number
}

export interface RegisterChange extends Change {
  name?: string
  /** has interrupt flag changed */
  interrupt?: true
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
