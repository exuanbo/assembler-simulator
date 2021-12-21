import { memorySerializer } from '../snapshotSerializers'
import { assemble } from '../../src/features/assembler/core'
import { getSourceFrom } from '../../src/features/memory/core'

expect.addSnapshotSerializer(memorySerializer)

describe('getSourceFrom', () => {
  it('should return correct source', () => {
    const [, addressToStatementMap] = assemble('jmp start start: add al, 01 mov bl, [cl] end')
    const source = getSourceFrom(addressToStatementMap)
    expect(source).toMatchSnapshot()
  })

  describe('with DB', () => {
    it('should display number', () => {
      const [, addressToStatementMap] = assemble('db a0 end')
      const source = getSourceFrom(addressToStatementMap)
      expect(source).toMatchSnapshot()
    })

    it('should split string', () => {
      const [, addressToStatementMap] = assemble('db "Hello, world!" end')
      const source = getSourceFrom(addressToStatementMap)
      expect(source).toMatchSnapshot()
    })
  })
})
