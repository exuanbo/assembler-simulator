import { produce } from 'immer'
import { assemble, initMemoryFrom, initCPU, step } from '../src/core'
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
