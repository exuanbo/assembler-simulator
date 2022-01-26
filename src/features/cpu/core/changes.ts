interface Change {
  from: number
  to: number
}

interface MemoryDataChange extends Change {
  address: number
}

export interface StepChanges {
  memoryData?: MemoryDataChange
}
