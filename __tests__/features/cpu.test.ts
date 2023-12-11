import { produce } from 'immer'

import { Opcode } from '@/common/constants'
import { assemble } from '@/features/assembler/core'
import {
  GeneralPurposeRegister,
  initRegisters,
  type Registers,
  RuntimeError,
  StatusRegisterFlag,
  step as __step,
  type StepOutput,
} from '@/features/cpu/core'
import { initialInputSignals, type InputSignals, SKIP } from '@/features/io/core'
import { initData, initDataFrom, type MemoryData } from '@/features/memory/core'

import { memoryDataSerializer, shortArraySerializer } from '../snapshotSerializers'

expect.addSnapshotSerializer(shortArraySerializer)
expect.addSnapshotSerializer(memoryDataSerializer)

const initialMemoryData = initData()

const getMemoryData = (input: string): MemoryData => {
  const [addressToMachineCodeMap] = assemble(input)
  return initDataFrom(addressToMachineCodeMap)
}

const initialRegisters = initRegisters()

const step = (
  memoryData: MemoryData,
  cpuRegisters: Registers,
  inputSignals: InputSignals = initialInputSignals,
): StepOutput => __step({ memoryData, cpuRegisters }, inputSignals)

describe('cpu', () => {
  describe('step', () => {
    it('should throw instance of RuntimeError', () => {
      const memoryData = produce(initialMemoryData, (draft) => {
        draft[0] = -1
      })
      try {
        step(memoryData, initialRegisters)
      } catch (error) {
        expect(error).toBeInstanceOf(RuntimeError)
      }
      expect.assertions(1)
    })

    it('should throw InvalidRegisterError', () => {
      const memoryData = produce(initialMemoryData, (draft) => {
        draft[0] = Opcode.INC_REG
        draft[1] = 0x04
      })
      expect(() => {
        step(memoryData, initialRegisters)
      }).toThrowErrorMatchingInlineSnapshot(`"Invalid register '04'."`)
    })

    it('should throw RunBeyondEndOfMemoryError', () => {
      const memoryData = produce(initialMemoryData, (draft) => {
        draft[0xfe] = Opcode.ADD_REG_TO_REG
        draft[0xff] = GeneralPurposeRegister.AL
      })
      const cpuRegisters = produce(initialRegisters, (draft) => {
        draft.ip = 0xfe
      })
      expect(() => {
        step(memoryData, cpuRegisters)
      }).toThrowErrorMatchingInlineSnapshot(`"Can not execute code beyond the end of RAM."`)
    })

    it('should throw InvalidOpcodeError', () => {
      const memoryData = produce(initialMemoryData, (draft) => {
        draft[0] = 0x10
      })
      expect(() => {
        step(memoryData, initialRegisters)
      }).toThrowErrorMatchingInlineSnapshot(`"Invalid opcode '10'."`)
    })

    it('with END should set halted', () => {
      const memoryData = getMemoryData('add al, bl end')
      const cpuRegisters = produce(initialRegisters, (draft) => {
        draft.ip = 3
      })
      expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
    })

    describe('with ADD', () => {
      const memoryData = getMemoryData('add al, bl end')

      it('should operate on two registers', () => {
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [1, 2, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should operate on register and number', () => {
        const memoryData = getMemoryData('add al, 02 end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [1, 0, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should set only zero flag', () => {
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [0xff, 1, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should only set sign flag', () => {
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [0x80, 1, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should set both overflow and sign flag', () => {
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [0x7f, 1, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })
    })

    describe('with SUB', () => {
      const memoryData = getMemoryData('sub al, bl end')

      it('should operate on two registers', () => {
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [3, 2, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should operate on register and number', () => {
        const memoryData = getMemoryData('sub al, 02 end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [3, 0, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should set only zero flag', () => {
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [1, 1, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should set only overflow flag', () => {
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [0x80, 1, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should only set sign flag', () => {
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [0x81, 1, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })
    })

    describe('with MUL', () => {
      it('should operate on two registers', () => {
        const memoryData = getMemoryData('mul al, bl end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [0xff, 4, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should operate on register and number', () => {
        const memoryData = getMemoryData('mul al, 04 end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [0xff, 0, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })
    })

    describe('with DIV', () => {
      it('should operate on two registers', () => {
        const memoryData = getMemoryData('div al, bl end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [3, 2, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should operate on register and number', () => {
        const memoryData = getMemoryData('div al, 02 end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [3, 0, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should throw DivideByZeroError if divisor is zero', () => {
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [3, 0, 0, 0]
        })

        expect(() => {
          step(getMemoryData('div al, bl end'), cpuRegisters)
        }).toThrowErrorMatchingInlineSnapshot(`"Can not divide by zero."`)

        expect(() => {
          step(getMemoryData('div al, 00 end'), cpuRegisters)
        }).toThrowErrorMatchingInlineSnapshot(`"Can not divide by zero."`)
      })
    })

    it('with INC should operate correctly', () => {
      const memoryData = getMemoryData('inc al end')
      const cpuRegisters = produce(initialRegisters, (draft) => {
        draft.gpr = [1, 0, 0, 0]
      })
      expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
    })

    it('with DEC should operate correctly', () => {
      const memoryData = getMemoryData('dec al end')
      const cpuRegisters = produce(initialRegisters, (draft) => {
        draft.gpr = [2, 0, 0, 0]
      })
      expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
    })

    describe('with MOD', () => {
      it('should operate on two registers', () => {
        const memoryData = getMemoryData('mod al, bl end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [5, 3, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should operate on register and number', () => {
        const memoryData = getMemoryData('mod al, 03 end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [5, 0, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should throw DivideByZeroError if divisor is zero', () => {
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [5, 0, 0, 0]
        })

        expect(() => {
          step(getMemoryData('mod al, bl end'), cpuRegisters)
        }).toThrowErrorMatchingInlineSnapshot(`"Can not divide by zero."`)

        expect(() => {
          step(getMemoryData('mod al, 00 end'), cpuRegisters)
        }).toThrowErrorMatchingInlineSnapshot(`"Can not divide by zero."`)
      })
    })

    describe('with AND', () => {
      it('should operate on two registers', () => {
        const memoryData = getMemoryData('and al, bl end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [5, 3, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should operate on register and number', () => {
        const memoryData = getMemoryData('and al, 03 end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [5, 0, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })
    })

    describe('with OR', () => {
      it('should operate on two registers', () => {
        const memoryData = getMemoryData('or al, bl end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [5, 3, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should operate on register and number', () => {
        const memoryData = getMemoryData('or al, 03 end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [5, 0, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })
    })

    describe('with XOR', () => {
      it('should operate on two registers', () => {
        const memoryData = getMemoryData('xor al, bl end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [5, 3, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should operate on register and number', () => {
        const memoryData = getMemoryData('xor al, 03 end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [5, 0, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })
    })

    it('with NOT should operate correctly', () => {
      const memoryData = getMemoryData('not al end')
      const cpuRegisters = produce(initialRegisters, (draft) => {
        draft.gpr = [1, 0, 0, 0]
      })
      expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
    })

    it('with ROL should operate correctly', () => {
      const memoryData = getMemoryData('rol al end')
      const cpuRegisters = produce(initialRegisters, (draft) => {
        draft.gpr = [0x81, 0, 0, 0]
      })
      expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
    })

    it('with ROR should operate correctly', () => {
      const memoryData = getMemoryData('ror al end')
      const cpuRegisters = produce(initialRegisters, (draft) => {
        draft.gpr = [0x81, 0, 0, 0]
      })
      expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
    })

    it('with SHL should operate correctly', () => {
      const memoryData = getMemoryData('shl al end')
      const cpuRegisters = produce(initialRegisters, (draft) => {
        draft.gpr = [1, 0, 0, 0]
      })
      expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
    })

    it('with SHR should operate correctly', () => {
      const memoryData = getMemoryData('shr al end')
      const cpuRegisters = produce(initialRegisters, (draft) => {
        draft.gpr = [1, 0, 0, 0]
      })
      expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
    })

    describe('with JMP', () => {
      it('should jump forward', () => {
        const memoryData = getMemoryData('jmp done add al, bl done: end')
        expect(step(memoryData, initialRegisters)).toMatchSnapshot()
      })

      it('should jump backward', () => {
        const memoryData = getMemoryData('start: add al, bl jmp start end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.ip = 3
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })
    })

    describe('with JZ', () => {
      it('should jump', () => {
        const memoryData = getMemoryData('jz done add al, bl done: end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.sr = StatusRegisterFlag.Zero
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should not jump', () => {
        const memoryData = getMemoryData('jz done add al, bl done: end')
        expect(step(memoryData, initialRegisters)).toMatchSnapshot()
      })
    })

    describe('with JNZ', () => {
      it('should jump', () => {
        const memoryData = getMemoryData('jnz done add al, bl done: end')
        expect(step(memoryData, initialRegisters)).toMatchSnapshot()
      })

      it('should not jump', () => {
        const memoryData = getMemoryData('jnz done add al, bl done: end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.sr = StatusRegisterFlag.Zero
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })
    })

    describe('with JS', () => {
      it('should jump', () => {
        const memoryData = getMemoryData('js done add al, bl done: end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.sr = StatusRegisterFlag.Sign
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should not jump', () => {
        const memoryData = getMemoryData('js done add al, bl done: end')
        expect(step(memoryData, initialRegisters)).toMatchSnapshot()
      })
    })

    describe('with JNS', () => {
      it('should jump', () => {
        const memoryData = getMemoryData('jns done add al, bl done: end')
        expect(step(memoryData, initialRegisters)).toMatchSnapshot()
      })

      it('should not jump', () => {
        const memoryData = getMemoryData('jns done add al, bl done: end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.sr = StatusRegisterFlag.Sign
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })
    })

    describe('with JO', () => {
      it('should jump', () => {
        const memoryData = getMemoryData('jo done add al, bl done: end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.sr = StatusRegisterFlag.Overflow
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should not jump', () => {
        const memoryData = getMemoryData('jo done add al, bl done: end')
        expect(step(memoryData, initialRegisters)).toMatchSnapshot()
      })
    })

    describe('with JNO', () => {
      it('should jump', () => {
        const memoryData = getMemoryData('jno done add al, bl done: end')
        expect(step(memoryData, initialRegisters)).toMatchSnapshot()
      })

      it('should not jump', () => {
        const memoryData = getMemoryData('jno done add al, bl done: end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.sr = StatusRegisterFlag.Overflow
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })
    })

    describe('with MOV', () => {
      it('should move number to register', () => {
        const memoryData = getMemoryData('mov al, 01 end')
        expect(step(memoryData, initialRegisters)).toMatchSnapshot()
      })

      it('should move number from address to register', () => {
        const memoryData = getMemoryData('mov al, [02] end')
        expect(step(memoryData, initialRegisters)).toMatchSnapshot()
      })

      it('should move number from register to address', () => {
        const memoryData = getMemoryData('mov [03], al end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [1, 0, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should move number from register address to register', () => {
        const memoryData = getMemoryData('mov al, [bl] end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [0, 2, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should move number from register to register address', () => {
        const memoryData = getMemoryData('mov [al], bl end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [3, 1, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })
    })

    describe('with CMP', () => {
      it('should compare two registers', () => {
        const memoryData = getMemoryData('cmp al, bl end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [1, 1, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should compare register and number', () => {
        const memoryData = getMemoryData('cmp al, 02 end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [1, 0, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should compare register and number from address', () => {
        const memoryData = getMemoryData('cmp al, [02] end')
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [3, 0, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })
    })

    describe('with PUSH', () => {
      const memoryData = getMemoryData('push al end')

      it('should push to stack', () => {
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [1, 0, 0, 0]
        })
        expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should throw StackOverflowError', () => {
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.gpr = [1, 0, 0, 0]
          draft.sp = 0
        })
        expect(() => {
          step(memoryData, cpuRegisters)
        }).toThrowErrorMatchingInlineSnapshot(`"Stack overflow."`)
      })
    })

    describe('with POP', () => {
      const memoryData = getMemoryData('pop al end')

      it('should pop to register from stack', () => {
        const __memoryData = produce(memoryData, (draft) => {
          draft[0xbf] = 1
        })
        const cpuRegisters = produce(initialRegisters, (draft) => {
          draft.sp = 0xbf - 1
        })
        expect(step(__memoryData, cpuRegisters)).toMatchSnapshot()
      })

      it('should throw StackUnderflowError', () => {
        expect(() => {
          step(memoryData, initialRegisters)
        }).toThrowErrorMatchingInlineSnapshot(`"Stack underflow."`)
      })
    })

    it('with PUSHF should push SR to stack', () => {
      const memoryData = getMemoryData('pushf end')
      const cpuRegisters = produce(initialRegisters, (draft) => {
        draft.sr = StatusRegisterFlag.Overflow | StatusRegisterFlag.Interrupt
      })
      expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
    })

    it('with POPF should restore SR from stack', () => {
      const memoryData = produce(getMemoryData('popf end'), (draft) => {
        draft[0xbf] = 0x14
      })
      const cpuRegisters = produce(initialRegisters, (draft) => {
        draft.sp = 0xbf - 1
      })
      expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
    })

    it('with CALL should jump to address', () => {
      const memoryData = getMemoryData('call 50 end')
      expect(step(memoryData, initialRegisters)).toMatchSnapshot()
    })

    it('with RET should return', () => {
      const memoryData = produce(getMemoryData('ret end'), (draft) => {
        draft[0xbf] = 0x10
      })
      const cpuRegisters = produce(initialRegisters, (draft) => {
        draft.sp = 0xbf - 1
      })
      expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
    })

    it('with INT should jump to address', () => {
      const memoryData = produce(getMemoryData('int 03 end'), (draft) => {
        draft[0x03] = 0x50
      })
      expect(step(memoryData, initialRegisters)).toMatchSnapshot()
    })

    it('with IRET should return', () => {
      const memoryData = produce(getMemoryData('iret end'), (draft) => {
        draft[0xbf] = 0x10
      })
      const cpuRegisters = produce(initialRegisters, (draft) => {
        draft.sp = 0xbf - 1
      })
      expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
    })

    describe('with IN', () => {
      const memoryData = getMemoryData('in 00 end')

      it('should create signal with input port', () => {
        expect(step(memoryData, initialRegisters)).toMatchSnapshot()
      })

      it('should create signal with required input port if provided is wrong', () => {
        expect(
          step(
            memoryData,
            initialRegisters,
            produce(initialInputSignals, (draft) => {
              draft.data.content = 0x61
              // @ts-expect-error: testing
              draft.data.port = 0x01
            }),
          ),
        ).toMatchSnapshot()
      })

      it('should skip if input data is NULL_INPUT_DATA', () => {
        expect(
          step(
            memoryData,
            produce(initialRegisters, (draft) => {
              draft.gpr = [1, 0, 0, 0]
            }),
            produce(initialInputSignals, (draft) => {
              draft.data.content = SKIP
              draft.data.port = 0x00
            }),
          ),
        ).toMatchSnapshot()
      })

      it('should read input from signal and move to AL', () => {
        expect(
          step(
            memoryData,
            initialRegisters,
            produce(initialInputSignals, (draft) => {
              draft.data.content = 0x61
              draft.data.port = 0x00
            }),
          ),
        ).toMatchSnapshot()
      })

      it('should throw InvalidPortError', () => {
        const memoryData = getMemoryData('in 10 end')
        expect(() => {
          step(memoryData, initialRegisters)
        }).toThrowErrorMatchingInlineSnapshot(
          `"I/O ports between 0 and F are available, got '10'."`,
        )
      })

      it('should throw InvalidInputDataError', () => {
        expect(() => {
          step(
            memoryData,
            initialRegisters,
            produce(initialInputSignals, (draft) => {
              draft.data.content = 0x100
              draft.data.port = 0x00
            }),
          )
        }).toThrowErrorMatchingInlineSnapshot(`"Input data '100' is greater than FF."`)
      })
    })

    it('with OUT should create signal with output port', () => {
      const memoryData = getMemoryData('out 01 end')
      const cpuRegisters = produce(initialRegisters, (draft) => {
        draft.gpr = [1, 0, 0, 0]
      })
      expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
    })

    it('should call INT if interrupt flag is set and receives an interrupt signal', () => {
      const memoryData = getMemoryData(`
jmp done
db 50
done:
end
`)
      const cpuRegisters = produce(initialRegisters, (draft) => {
        draft.sr = StatusRegisterFlag.Interrupt
      })
      expect(
        step(
          memoryData,
          cpuRegisters,
          produce(initialInputSignals, (draft) => {
            draft.interrupt = true
          }),
        ),
      ).toMatchSnapshot()
    })

    it('with STI should set interrupt flag', () => {
      const memoryData = getMemoryData('sti end')
      expect(step(memoryData, initialRegisters)).toMatchSnapshot()
    })

    it('with CLI should unset interrupt flag', () => {
      const memoryData = getMemoryData('cli end')
      const cpuRegisters = produce(initialRegisters, (draft) => {
        draft.sr = StatusRegisterFlag.Interrupt
      })
      expect(step(memoryData, cpuRegisters)).toMatchSnapshot()
    })

    it('with CLO should create closeWindows signal', () => {
      const memoryData = getMemoryData('clo end')
      expect(step(memoryData, initialRegisters)).toMatchSnapshot()
    })

    it('with NOP should do nothing', () => {
      const memoryData = getMemoryData('nop end')
      expect(step(memoryData, initialRegisters)).toMatchSnapshot()
    })
  })
})
