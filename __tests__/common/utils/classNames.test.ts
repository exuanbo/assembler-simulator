import { classNames } from '@/common/utils'

describe('classNames', () => {
  it('should return empty string with no arguments', () => {
    expect(classNames()).toEqual('')
  })

  it('should concat strings', () => {
    expect(classNames('a', 'b')).toEqual('a b')
  })

  it('should ignore undefined', () => {
    expect(classNames(undefined)).toEqual('')
    expect(classNames('a', undefined, 'b')).toEqual('a b')
  })

  it('should concat object property with true value', () => {
    expect(classNames({ a: true })).toEqual('a')
    expect(classNames('a', { b: true }, 'c')).toEqual('a b c')
  })

  it('should ignore object property with falsy value', () => {
    expect(classNames({ a: false, b: null, c: undefined })).toEqual('')
    expect(classNames('a', { b: false }, 'c')).toEqual('a c')
  })
})
