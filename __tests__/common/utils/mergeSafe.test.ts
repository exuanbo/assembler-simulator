import { mergeSafe } from '@/common/utils'

describe('mergeSafe', () => {
  it('should not merge when types are different', () => {
    const target = { a: 1 }
    const source = 'string'
    const result = mergeSafe(target, source)
    expect(result).toEqual(target)
  })

  it('should deeply merge when key from source exists in target', () => {
    const target = { a: { b: { c: 1 }, d: 3 } }
    const source = { a: { b: { c: 2 } } }
    const result = mergeSafe(target, source)
    expect(result).toEqual({ a: { b: { c: 2 }, d: 3 } })
  })

  it('should not merge when key from source does not exist in target', () => {
    const target = { a: 1 }
    const source = { b: 2 }
    const result = mergeSafe(target, source)
    expect(result).toEqual(target)
  })

  it('should not deeply merge when nested key from source does not exist in target', () => {
    const target = { a: { b: 1 } }
    const source = { a: { c: 2 } }
    const result = mergeSafe(target, source)
    expect(result).toEqual(target)
  })

  it('should not merge arrays', () => {
    const target = { a: [1, 2] }
    const source = { a: [3, 4] }
    const result = mergeSafe(target, source)
    expect(result).toEqual(source)
  })

  it('should handle symbols as keys', () => {
    const key = Symbol('key')
    const target = { [key]: 1 }
    const source = { [key]: 2 }
    const result = mergeSafe(target, source)
    expect(result[key]).toBe(2)
  })

  it('should not mutate the original objects', () => {
    const target = { a: 1 }
    const source = { a: 2 }
    const result = mergeSafe(target, source)
    expect(result).not.toBe(target)
    expect(result).not.toBe(source)
  })

  it('should not deeply mutate the original objects', () => {
    const target = { a: { b: 1 } }
    const source = { a: { b: 2 } }
    const result = mergeSafe(target, source)
    expect(result.a).not.toBe(target.a)
    expect(result.a).not.toBe(source.a)
  })

  it('should handle undefined and null values', () => {
    const target = { a: 1, b: undefined }
    const source = { b: null, c: 3 }
    const result = mergeSafe(target, source)
    expect(result).toEqual({ a: 1, b: undefined })
  })

  it('should return the target when no sources are provided', () => {
    const target = { a: 1 }
    const result = mergeSafe(target)
    expect(result).toEqual(target)
  })
})
