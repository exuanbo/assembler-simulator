import { produce } from 'immer'
import { assemble } from '../src/features/assembler/core'
import { initMemoryFrom } from '../src/features/memory/core'
import { initCPU, step } from '../src/features/cpu/core'
import { shortArrayOfNumbersSerializer, memorySerializer } from './snapshotSerializers'

expect.addSnapshotSerializer(shortArrayOfNumbersSerializer)
expect.addSnapshotSerializer(memorySerializer)

const getMemory = (input: string): number[] => {
  const [addressToMachineCodeMap] = assemble(input)
  return initMemoryFrom(addressToMachineCodeMap)
}

describe('cpu', () => {
  describe('step', () => {
    it('should performe ADD', () => {
      const cpu = produce(initCPU(), draft => {
        draft.gpr = [1, 2, 0, 0]
      })
      const memory = getMemory('add al, bl end')
      expect(step(cpu, memory)).toMatchSnapshot()
    })
  })
})
