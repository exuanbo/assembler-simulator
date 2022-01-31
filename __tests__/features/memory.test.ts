import { assemble } from '@/features/assembler/core'
import {
  initVduData,
  initData,
  getVduDataFrom,
  getSourceFrom,
  vduDataChanged
} from '@/features/memory/core'
import { memorySerializer } from '../snapshotSerializers'

expect.addSnapshotSerializer(memorySerializer)

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

  describe('vduDataChanged', () => {
    it('should return true if VDU data is changed', () => {
      const vduData = initVduData()
      vduData[0] = 'foo'.charCodeAt(0)
      expect(vduDataChanged(vduData)).toBe(true)
    })

    it('should return false if VDU data is not changed', () => {
      const vduData = initVduData()
      expect(vduDataChanged(vduData)).toBe(false)
    })
  })
})
