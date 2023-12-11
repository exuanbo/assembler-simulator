import { assemble, AssemblerError } from '@/features/assembler/core'
import { examples } from '@/features/editor/examples'
import { initDataFrom } from '@/features/memory/core'

import { memoryDataSerializer } from '../../snapshotSerializers'

expect.addSnapshotSerializer(memoryDataSerializer)

describe('assembler', () => {
  examples.forEach(({ title, content }) => {
    it(`should assemble example ${title}`, () => {
      const [addressToMachineCodeMap] = assemble(content)
      expect(initDataFrom(addressToMachineCodeMap)).toMatchSnapshot()
    })
  })

  it('should throw instance of AssemblerError', () => {
    try {
      assemble('foo')
    } catch (error) {
      expect(error).toBeInstanceOf(AssemblerError)
    }
    expect.assertions(1)
  })

  it('should throw DuplicateLabelError', () => {
    expect(() => {
      assemble(`
start: inc al
start: dec bl
end
`)
    }).toThrowErrorMatchingInlineSnapshot(`"Duplicate label 'START'."`)
  })

  it('should throw EndOfMemoryError', () => {
    expect(() => {
      assemble(`
org ff
inc al
end
`)
    }).toThrowErrorMatchingInlineSnapshot(`"Can not generate code beyond the end of RAM."`)
  })

  it('should throw LabelNotExistError', () => {
    expect(() => {
      assemble('jmp start end')
    }).toThrowErrorMatchingInlineSnapshot(`"Label 'start' does not exist."`)
  })

  it('should throw JumpDistanceError', () => {
    expect(() => {
      assemble(`
start:
inc al
org fd
jmp start
end
`)
    }).toThrowErrorMatchingInlineSnapshot(`"Jump distance should be between -128 and 127."`)
  })
})
