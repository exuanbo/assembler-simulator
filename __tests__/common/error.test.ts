import { errorToPlainObject } from '@/common/error'

describe('ErrorObject', () => {
  describe('errorToPlainObject', () => {
    it('should return plain object', () => {
      const errorObject = errorToPlainObject(new Error('test'))
      expect(errorObject).not.toBeInstanceOf(Error)
      expect(Object.getPrototypeOf(errorObject)).toBe(Object.prototype)
      expect(errorObject).toMatchObject({
        name: 'Error',
        message: 'test',
        stack: expect.any(String),
      })
    })
  })
})
