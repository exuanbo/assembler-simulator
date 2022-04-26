import {
  decToBin,
  decTo8bitBinDigits,
  clamp,
  range,
  splitCamelCaseToString,
  asciiToChars,
  compareArrayWithSameLength,
  curryRight2,
  throttle
} from '@/common/utils'

describe('decToBin', () => {
  it('should convert decimal to binary', () => {
    expect(decToBin(0)).toBe('00000000')
    expect(decToBin(255)).toBe('11111111')
  })
})

describe('decTo8bitBinDigits', () => {
  it('should convert decimal to 8 bit binary digits', () => {
    expect(decTo8bitBinDigits(0)).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
    expect(decTo8bitBinDigits(255)).toEqual([1, 1, 1, 1, 1, 1, 1, 1])
  })
})

describe('clamp', () => {
  it('should clamp number to min and max', () => {
    expect(clamp(0, 1, 3)).toBe(1)
    expect(clamp(2, 1, 3)).toBe(2)
    expect(clamp(4, 1, 3)).toBe(3)
  })
})

describe('range', () => {
  it('should generate an array of numbers', () => {
    expect(range(1, 5)).toEqual([1, 2, 3, 4])
  })

  it('should generate an array of numbers without `start`', () => {
    expect(range(3)).toEqual([0, 1, 2])
  })
})

describe('splitCamelCaseToString', () => {
  it('should convert camelCase to startCase', () => {
    expect(splitCamelCaseToString('camelCase')).toBe('camel Case')
  })
})

describe('asciiToChars', () => {
  it('should convert an array of numbers to characters', () => {
    expect(asciiToChars([97, 98, 99])).toEqual(['a', 'b', 'c'])
  })
})

describe('compareArrayWithSameLength', () => {
  it('should return true if arrays are equal', () => {
    expect(compareArrayWithSameLength([1, 2, 3], [1, 2, 3])).toBe(true)
  })

  it('should return false if arrays are not equal', () => {
    expect(compareArrayWithSameLength([1, 2, 3], [1, 2, 4])).toBe(false)
  })
})

describe('curryRight2', () => {
  it('should curry a function with two arguments', () => {
    const add = (a: number, b: number): number => a + b
    expect(curryRight2(add)(1)(2)).toBe(3)
  })

  it('should curry a function with its arguments reversed', () => {
    const concatStrings = (a: string, b: string): string => a + b
    expect(curryRight2(concatStrings)('a')('b')).toBe('ba')
  })
})

describe('throttle', () => {
  it('should throttle a function', () => {
    const fn = jest.fn()
    const throttledFn = throttle(fn, 1000)
    throttledFn()
    throttledFn()
    throttledFn()
    throttledFn()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should throttle a function with arguments', () => {
    const fn = jest.fn()
    const throttledFn = throttle(fn, 1000)
    throttledFn(1, 2, 3)
    throttledFn(1, 2, 3)
    throttledFn(1, 2, 3)
    throttledFn(1, 2, 3)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should throttle a function and queue', async () => {
    const fn = jest.fn()
    const throttledFn = throttle(fn, 1000)
    throttledFn()
    throttledFn()
    throttledFn()
    await new Promise(resolve => setTimeout(resolve, 2000))
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
