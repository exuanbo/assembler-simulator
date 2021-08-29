import { produce } from 'immer'
import { assemble } from '../src/features/assembler/core'
import { init as initCPU, step } from '../src/features/cpu/core'
import { initFrom as initMemoryFrom } from '../src/features/memory/core'
import { shortArraySerializer, memorySerializer } from './snapshotSerializers'

expect.addSnapshotSerializer(shortArraySerializer)
expect.addSnapshotSerializer(memorySerializer)

const getMemory = (input: string): number[] => {
  const [addressToMachineCodeMap] = assemble(input)
  return initMemoryFrom(addressToMachineCodeMap)
}

const initialCPU = initCPU()

describe('cpu', () => {
  describe('step', () => {
    it('with END should set halted', () => {
      const memory = getMemory('add al, bl end')
      const cpu = produce(initialCPU, draft => {
        draft.ip = 3
      })
      expect(step(memory, cpu)).toMatchSnapshot()
    })

    describe('with ADD', () => {
      it('should operate on two registers', () => {
        const memory = getMemory('add al, bl end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [1, 2, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should operate on register and number', () => {
        const memory = getMemory('add al, 02 end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [1, 0, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should set only zero flag', () => {
        const memory = getMemory('add al, bl end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [0xff, 1, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should only set sign flag', () => {
        const memory = getMemory('add al, bl end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [0x80, 1, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should set both overflow and sign flag', () => {
        const memory = getMemory('add al, bl end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [0x7f, 1, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })
    })

    describe('with SUB', () => {
      it('should operate on two registers', () => {
        const memory = getMemory('sub al, bl end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [3, 2, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should operate on register and number', () => {
        const memory = getMemory('sub al, 02 end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [3, 0, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should set only zero flag', () => {
        const memory = getMemory('sub al, bl end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [1, 1, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should set only overflow flag', () => {
        const memory = getMemory('sub al, bl end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [0x80, 1, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should only set sign flag', () => {
        const memory = getMemory('sub al, bl end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [0x81, 1, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })
    })

    describe('with MUL', () => {
      it('should operate on two registers', () => {
        const memory = getMemory('mul al, bl end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [0xff, 4, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should operate on register and number', () => {
        const memory = getMemory('mul al, 04 end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [0xff, 0, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })
    })

    describe('with DIV', () => {
      it('should operate on two registers', () => {
        const memory = getMemory('div al, bl end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [3, 2, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should operate on register and number', () => {
        const memory = getMemory('div al, 02 end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [3, 0, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should throw DivideByZeroError if divisor is zero', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [3, 0, 0, 0]
        })

        expect(() => {
          step(getMemory('div al, bl end'), cpu)
        }).toThrowError('Can not divide by zero')

        expect(() => {
          step(getMemory('div al, 00 end'), cpu)
        }).toThrowError('Can not divide by zero')
      })
    })

    it('with INC should operate correctly', () => {
      const memory = getMemory('inc al end')
      const cpu = produce(initialCPU, draft => {
        draft.gpr = [1, 0, 0, 0]
      })
      expect(step(memory, cpu)).toMatchSnapshot()
    })

    it('with DEC should operate correctly', () => {
      const memory = getMemory('dec al end')
      const cpu = produce(initialCPU, draft => {
        draft.gpr = [2, 0, 0, 0]
      })
      expect(step(memory, cpu)).toMatchSnapshot()
    })

    describe('with MOD', () => {
      it('should operate on two registers', () => {
        const memory = getMemory('mod al, bl end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [5, 3, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should operate on register and number', () => {
        const memory = getMemory('mod al, 03 end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [5, 0, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should throw DivideByZeroError if divisor is zero', () => {
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [5, 0, 0, 0]
        })

        expect(() => {
          step(getMemory('mod al, bl end'), cpu)
        }).toThrowError('Can not divide by zero')

        expect(() => {
          step(getMemory('mod al, 00 end'), cpu)
        }).toThrowError('Can not divide by zero')
      })
    })

    describe('with AND', () => {
      it('should operate on two registers', () => {
        const memory = getMemory('and al, bl end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [5, 3, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should operate on register and number', () => {
        const memory = getMemory('and al, 03 end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [5, 0, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })
    })

    describe('with OR', () => {
      it('should operate on two registers', () => {
        const memory = getMemory('or al, bl end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [5, 3, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should operate on register and number', () => {
        const memory = getMemory('or al, 03 end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [5, 0, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })
    })

    describe('with XOR', () => {
      it('should operate on two registers', () => {
        const memory = getMemory('xor al, bl end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [5, 3, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should operate on register and number', () => {
        const memory = getMemory('xor al, 03 end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [5, 0, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })
    })

    it('with NOT should operate correctly', () => {
      const memory = getMemory('not al end')
      const cpu = produce(initialCPU, draft => {
        draft.gpr = [1, 0, 0, 0]
      })
      expect(step(memory, cpu)).toMatchSnapshot()
    })

    it('with ROL should operate correctly', () => {
      const memory = getMemory('rol al end')
      const cpu = produce(initialCPU, draft => {
        draft.gpr = [0x81, 0, 0, 0]
      })
      expect(step(memory, cpu)).toMatchSnapshot()
    })

    it('with ROR should operate correctly', () => {
      const memory = getMemory('ror al end')
      const cpu = produce(initialCPU, draft => {
        draft.gpr = [0x81, 0, 0, 0]
      })
      expect(step(memory, cpu)).toMatchSnapshot()
    })

    it('with SHL should operate correctly', () => {
      const memory = getMemory('shl al end')
      const cpu = produce(initialCPU, draft => {
        draft.gpr = [1, 0, 0, 0]
      })
      expect(step(memory, cpu)).toMatchSnapshot()
    })

    it('with SHR should operate correctly', () => {
      const memory = getMemory('shr al end')
      const cpu = produce(initialCPU, draft => {
        draft.gpr = [1, 0, 0, 0]
      })
      expect(step(memory, cpu)).toMatchSnapshot()
    })

    describe('with JMP', () => {
      it('should jump forward', () => {
        const memory = getMemory('jmp done add al, bl done: end')
        expect(step(memory, initialCPU)).toMatchSnapshot()
      })

      it('should jump backward', () => {
        const memory = getMemory('start: add al, bl jmp start end')
        const cpu = produce(initialCPU, draft => {
          draft.ip = 3
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })
    })

    describe('with JZ', () => {
      it('should jump', () => {
        const memory = getMemory('jz done add al, bl done: end')
        const cpu = produce(initialCPU, draft => {
          draft.sr[0] = true
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should not jump', () => {
        const memory = getMemory('jz done add al, bl done: end')
        expect(step(memory, initialCPU)).toMatchSnapshot()
      })
    })

    describe('with JNZ', () => {
      it('should jump', () => {
        const memory = getMemory('jnz done add al, bl done: end')
        expect(step(memory, initialCPU)).toMatchSnapshot()
      })

      it('should not jump', () => {
        const memory = getMemory('jnz done add al, bl done: end')
        const cpu = produce(initialCPU, draft => {
          draft.sr[0] = true
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })
    })

    describe('with JS', () => {
      it('should jump', () => {
        const memory = getMemory('js done add al, bl done: end')
        const cpu = produce(initialCPU, draft => {
          draft.sr[2] = true
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should not jump', () => {
        const memory = getMemory('js done add al, bl done: end')
        expect(step(memory, initialCPU)).toMatchSnapshot()
      })
    })

    describe('with JNS', () => {
      it('should jump', () => {
        const memory = getMemory('jns done add al, bl done: end')
        expect(step(memory, initialCPU)).toMatchSnapshot()
      })

      it('should not jump', () => {
        const memory = getMemory('jns done add al, bl done: end')
        const cpu = produce(initialCPU, draft => {
          draft.sr[2] = true
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })
    })

    describe('with JO', () => {
      it('should jump', () => {
        const memory = getMemory('jo done add al, bl done: end')
        const cpu = produce(initialCPU, draft => {
          draft.sr[1] = true
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should not jump', () => {
        const memory = getMemory('jo done add al, bl done: end')
        expect(step(memory, initialCPU)).toMatchSnapshot()
      })
    })

    describe('with JNO', () => {
      it('should jump', () => {
        const memory = getMemory('jno done add al, bl done: end')
        expect(step(memory, initialCPU)).toMatchSnapshot()
      })

      it('should not jump', () => {
        const memory = getMemory('jno done add al, bl done: end')
        const cpu = produce(initialCPU, draft => {
          draft.sr[1] = true
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })
    })

    describe('with MOV', () => {
      it('should move number to register', () => {
        const memory = getMemory('mov al, 01 end')
        expect(step(memory, initialCPU)).toMatchSnapshot()
      })

      it('should move number from address to register', () => {
        const memory = getMemory('mov al, [02] end')
        expect(step(memory, initialCPU)).toMatchSnapshot()
      })

      it('should move number from register to address', () => {
        const memory = getMemory('mov [03], al end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [1, 0, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should move number from register address to register', () => {
        const memory = getMemory('mov al, [bl] end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [0, 2, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should move number from register to register address', () => {
        const memory = getMemory('mov [al], bl end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [3, 1, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })
    })

    describe('with CMP', () => {
      it('should compare two registers', () => {
        const memory = getMemory('cmp al, bl end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [1, 1, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should compare register and number', () => {
        const memory = getMemory('cmp al, 02 end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [1, 0, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should compare register and number from address', () => {
        const memory = getMemory('cmp al, [02] end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [3, 0, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })
    })

    describe('with PUSH', () => {
      it('should push to stack', () => {
        const memory = getMemory('push al end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [1, 0, 0, 0]
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should throw StackOverflowError', () => {
        const memory = getMemory('push al end')
        const cpu = produce(initialCPU, draft => {
          draft.gpr = [1, 0, 0, 0]
          draft.sp = 0
        })
        expect(() => step(memory, cpu)).toThrowError('Stack overflow')
      })
    })

    describe('with POP', () => {
      it('should pop to register from stack', () => {
        const memory = produce(getMemory('pop al end'), draft => {
          draft[0xbf] = 1
        })
        const cpu = produce(initialCPU, draft => {
          draft.sp = 0xbf - 1
        })
        expect(step(memory, cpu)).toMatchSnapshot()
      })

      it('should throw StackUnderflowError', () => {
        const memory = getMemory('pop al end')
        expect(() => step(memory, initialCPU)).toThrowError('Stack underflow')
      })
    })

    it('with PUSHF should push SR to stack', () => {
      const memory = getMemory('pushf end')
      const cpu = produce(initialCPU, draft => {
        draft.sr = [false, true, true, false]
      })
      expect(step(memory, cpu)).toMatchSnapshot()
    })

    it('with POPF should restore SR from stack', () => {
      const memory = produce(getMemory('popf end'), draft => {
        draft[0xbf] = 0x0c
      })
      const cpu = produce(initialCPU, draft => {
        draft.sp = 0xbf - 1
      })
      expect(step(memory, cpu)).toMatchSnapshot()
    })

    it('with CALL should jump to address', () => {
      const memory = getMemory('call 50 end')
      expect(step(memory, initialCPU)).toMatchSnapshot()
    })

    it('with RET should return', () => {
      const memory = produce(getMemory('ret end'), draft => {
        draft[0xbf] = 0x10
      })
      const cpu = produce(initialCPU, draft => {
        draft.sp = 0xbf - 1
      })
      expect(step(memory, cpu)).toMatchSnapshot()
    })

    it('with INT should jump to address', () => {
      const memory = produce(getMemory('int 03 end'), draft => {
        draft[0x03] = 0x50
      })
      expect(step(memory, initialCPU)).toMatchSnapshot()
    })

    it('with IRET should return', () => {
      const memory = produce(getMemory('iret end'), draft => {
        draft[0xbf] = 0x10
      })
      const cpu = produce(initialCPU, draft => {
        draft.sp = 0xbf - 1
      })
      expect(step(memory, cpu)).toMatchSnapshot()
    })

    describe('with IN', () => {
      const memory = getMemory('in 00 end')

      it('should create signal with input port', () => {
        expect(step(memory, initialCPU)).toMatchSnapshot()
      })

      it('should read input from signal and move to AL', () => {
        expect(step(memory, initialCPU, { input: 0x61 })).toMatchSnapshot()
      })

      it('should throw PortError', () => {
        const memory = getMemory('in 10 end')
        expect(() => {
          step(memory, initialCPU)
        }).toThrow('I/O ports between 0 and F are available.')
      })
    })

    it('with OUT should create signal with output port', () => {
      const memory = getMemory('out 01 end')
      expect(step(memory, initialCPU)).toMatchSnapshot()
    })
  })
})
