import { range, asciiToChars } from '../../src/common/utils'

describe('utils', () => {
  describe('range', () => {
    it('should generate an array of numbers', () => {
      expect(range(1, 5)).toEqual([1, 2, 3, 4])
    })

    it('should generate an array of numbers without `start`', () => {
      expect(range(3)).toEqual([0, 1, 2])
    })
  })

  describe('asciiToChars', () => {
    it('should convert an array of numbers to characters', () => {
      expect(asciiToChars([97, 98, 99])).toEqual(['a', 'b', 'c'])
    })
  })
})
