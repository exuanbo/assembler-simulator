import { produce } from 'immer'
import { assemble } from '../src/features/assembler/core'
import { initMemoryFrom } from '../src/features/memory/core'
import { initCPU, step } from '../src/features/cpu/core'
import { shortArraySerializer, memorySerializer } from './snapshotSerializers'

expect.addSnapshotSerializer(shortArraySerializer)
expect.addSnapshotSerializer(memorySerializer)

const initialCPU = initCPU()

const getMemory = (input: string): number[] => {
  const [addressToMachineCodeMap] = assemble(input)
  return initMemoryFrom(addressToMachineCodeMap)
}

describe('cpu', () => {
  describe('step', () => {
    it('with END should set halted', () => {
      const cpu = produce(initialCPU, draft => {
        draft.ip = 3
      })
      const memory = getMemory('add al, bl end')
      expect(step(cpu, memory)).toMatchSnapshot()
    })

    describe('with ADD', () => {
      it('should operate on two registers', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [1, 2, 0, 0]
        })
        const memory = getMemory('add al, bl end')
        expect(step(cpu, memory)).toMatchSnapshot()
      })

      it('should set only zero flag', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [0xff, 1, 0, 0]
        })
        const memory = getMemory('add al, bl end')
        expect(step(cpu, memory)).toMatchSnapshot()
      })

      it('should only set sign flag', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [0x80, 1, 0, 0]
        })
        const memory = getMemory('add al, bl end')
        expect(step(cpu, memory)).toMatchSnapshot()
      })

      it('should set both overflow and sign flag', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [0x7f, 1, 0, 0]
        })
        const memory = getMemory('add al, bl end')
        expect(step(cpu, memory)).toMatchSnapshot()
      })
    })

    describe('with SUB', () => {
      it('should operate on two registers', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [3, 2, 0, 0]
        })
        const memory = getMemory('sub al, bl end')
        expect(step(cpu, memory)).toMatchSnapshot()
      })

      it('should set only zero flag', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [1, 1, 0, 0]
        })
        const memory = getMemory('sub al, bl end')
        expect(step(cpu, memory)).toMatchSnapshot()
      })

      it('should set only overflow flag', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [0x80, 1, 0, 0]
        })
        const memory = getMemory('sub al, bl end')
        expect(step(cpu, memory)).toMatchSnapshot()
      })

      it('should only set sign flag', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [0x81, 1, 0, 0]
        })
        const memory = getMemory('sub al, bl end')
        expect(step(cpu, memory)).toMatchSnapshot()
      })
    })

    describe('with MUL', () => {
      it('should operate on two registers', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [0xff, 4, 0, 0]
        })
        const memory = getMemory('mul al, bl end')
        expect(step(cpu, memory)).toMatchSnapshot()
      })
    })

    describe('with DIV', () => {
      it('should operate on two registers', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [3, 2, 0, 0]
        })
        const memory = getMemory('div al, bl end')
        expect(step(cpu, memory)).toMatchSnapshot()
      })

      it('should throw DivideByZeroError if divisor is zero', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [3, 0, 0, 0]
        })
        const memory = getMemory('div al, bl end')
        expect(() => {
          step(cpu, memory)
        }).toThrowError('Can not divide by zero')
      })
    })

    it('with INC should operate correctly', () => {
      const cpu = produce(initialCPU, draft => {
        draft.gpr = [1, 0, 0, 0]
      })
      const memory = getMemory('inc al end')
      expect(step(cpu, memory)).toMatchSnapshot()
    })

    it('with DEC should operate correctly', () => {
      const cpu = produce(initialCPU, draft => {
        draft.gpr = [2, 0, 0, 0]
      })
      const memory = getMemory('dec al end')
      expect(step(cpu, memory)).toMatchSnapshot()
    })

    describe('with MOD', () => {
      it('should operate on two registers', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [5, 3, 0, 0]
        })
        const memory = getMemory('mod al, bl end')
        expect(step(cpu, memory)).toMatchSnapshot()
      })

      it('should throw DivideByZeroError if divisor is zero', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [5, 0, 0, 0]
        })
        const memory = getMemory('mod al, bl end')
        expect(() => {
          step(cpu, memory)
        }).toThrowError('Can not divide by zero')
      })
    })

    describe('with AND', () => {
      it('should operate on two registers', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [5, 3, 0, 0]
        })
        const memory = getMemory('and al, bl end')
        expect(step(cpu, memory)).toMatchSnapshot()
      })
    })

    describe('with OR', () => {
      it('should operate on two registers', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [5, 3, 0, 0]
        })
        const memory = getMemory('or al, bl end')
        expect(step(cpu, memory)).toMatchSnapshot()
      })
    })

    describe('with XOR', () => {
      it('should operate on two registers', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [5, 3, 0, 0]
        })
        const memory = getMemory('xor al, bl end')
        expect(step(cpu, memory)).toMatchSnapshot()
      })
    })

    it('with NOT should operate correctly', () => {
      const cpu = produce(initialCPU, draft => {
        draft.gpr = [1, 0, 0, 0]
      })
      const memory = getMemory('not al end')
      expect(step(cpu, memory)).toMatchSnapshot()
    })

    it('with ROL should operate correctly', () => {
      const cpu = produce(initialCPU, draft => {
        draft.gpr = [0x81, 0, 0, 0]
      })
      const memory = getMemory('rol al end')
      expect(step(cpu, memory)).toMatchSnapshot()
    })

    it('with ROR should operate correctly', () => {
      const cpu = produce(initialCPU, draft => {
        draft.gpr = [0x81, 0, 0, 0]
      })
      const memory = getMemory('ror al end')
      expect(step(cpu, memory)).toMatchSnapshot()
    })

    it('with SHL should operate correctly', () => {
      const cpu = produce(initialCPU, draft => {
        draft.gpr = [1, 0, 0, 0]
      })
      const memory = getMemory('shl al end')
      expect(step(cpu, memory)).toMatchSnapshot()
    })

    it('with SHR should operate correctly', () => {
      const cpu = produce(initialCPU, draft => {
        draft.gpr = [1, 0, 0, 0]
      })
      const memory = getMemory('shr al end')
      expect(step(cpu, memory)).toMatchSnapshot()
    })
  })
})
