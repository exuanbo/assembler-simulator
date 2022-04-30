import { assemble } from '@/features/assembler/core'
import { initData, getVduDataFrom, getSourceFrom } from '@/features/memory/core'
import { memoryDataSerializer } from '../snapshotSerializers'

expect.addSnapshotSerializer(memoryDataSerializer)

describe('memory', () => {
  describe('getVduDataFrom', () => {
    it('should return the VDU data', () => {
      const memoryData = initData()
      const vduData = getVduDataFrom(memoryData)
      expect(vduData).toMatchSnapshot()
    })
  })

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
})
