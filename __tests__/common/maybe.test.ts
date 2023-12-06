import { fromFalsy, fromNullable, just, nothing } from '@/common/maybe'

describe('Maybe', () => {
  describe('fromNullable', () => {
    it('should create a Maybe with a value', () => {
      const result = fromNullable(1)
      expect(result.extract()).toBe(1)
      expect(result.extractNullable()).toBe(1)
    })

    it('should create a Maybe with null', () => {
      const result = fromNullable<number>(null)
      expect(result.extract()).toBe(undefined)
      expect(result.extractNullable()).toBe(null)
    })

    it('should create a Maybe with undefined', () => {
      const result = fromNullable<number>(undefined)
      expect(result.extract()).toBe(undefined)
      expect(result.extractNullable()).toBe(null)
    })
  })

  describe('fromFalsy', () => {
    it('should create a Maybe with a value', () => {
      const result = fromFalsy(1)
      expect(result.extract()).toBe(1)
      expect(result.extractNullable()).toBe(1)
    })

    it('should create a Maybe with null', () => {
      const result = fromFalsy<number>(null)
      expect(result.extract()).toBe(undefined)
      expect(result.extractNullable()).toBe(null)
    })

    it('should create a Maybe with undefined', () => {
      const result = fromFalsy<number>(undefined)
      expect(result.extract()).toBe(undefined)
      expect(result.extractNullable()).toBe(null)
    })

    it('should create a Maybe with false', () => {
      const result = fromFalsy<number>(false)
      expect(result.extract()).toBe(undefined)
      expect(result.extractNullable()).toBe(null)
    })

    it('should create a Maybe with 0', () => {
      const result = fromFalsy<number>(0)
      expect(result.extract()).toBe(undefined)
      expect(result.extractNullable()).toBe(null)
    })

    it('should create a Maybe with an empty string', () => {
      const result = fromFalsy<string>('')
      expect(result.extract()).toBe(undefined)
      expect(result.extractNullable()).toBe(null)
    })
  })

  describe('just', () => {
    it('should create a Maybe with a value', () => {
      const result = just(1)
      expect(result.isJust()).toBeTruthy()
      expect(result.isNothing()).toBeFalsy()
    })
  })

  describe('nothing', () => {
    it('should create a Maybe with a nullable value', () => {
      const result = nothing<number>()
      expect(result.isJust()).toBeFalsy()
      expect(result.isNothing()).toBeTruthy()
    })
  })

  describe('map', () => {
    it('should map a value', () => {
      const result = fromNullable(1).map((x) => x + 1)
      expect(result.extract()).toBe(2)
    })

    it('should map a nullable value', () => {
      const result = fromNullable<number>(null).map((x) => x + 1)
      expect(result.extract()).toBe(undefined)
    })
  })

  describe('chain', () => {
    it('should chain a value', () => {
      const result = fromNullable(1).chain((x) => just(x + 1))
      expect(result.extract()).toBe(2)
    })

    it('should chain a nullable value', () => {
      const result = fromNullable<number>(null).chain((x) => just(x + 1))
      expect(result.extract()).toBe(undefined)
    })
  })

  describe('orDefault', () => {
    it('should return a value', () => {
      const result = fromNullable(1).orDefault(2)
      expect(result).toBe(1)
    })

    it('should return a default value', () => {
      const result = fromNullable<number>(null).orDefault(2)
      expect(result).toBe(2)
    })
  })

  describe('orDefaultLazy', () => {
    it('should return a value', () => {
      const result = fromNullable(1).orDefaultLazy(() => 2)
      expect(result).toBe(1)
    })

    it('should return a default value', () => {
      const result = fromNullable<number>(null).orDefaultLazy(() => 2)
      expect(result).toBe(2)
    })
  })

  describe('filter', () => {
    it('should filter with truthy predicate', () => {
      const result = fromNullable(1).filter((x) => x === 1)
      expect(result.extract()).toBe(1)
    })

    it('should filter with falsy predicate', () => {
      const result = fromNullable(1).filter((x) => x === 2)
      expect(result.extract()).toBe(undefined)
    })

    it('should filter a nullable value', () => {
      const result = fromNullable<number>(null).filter((x) => x === 1)
      expect(result.extract()).toBe(undefined)
    })
  })

  describe('ifJust', () => {
    it('should call a function with a value', () => {
      expect.assertions(1)
      fromNullable(1).ifJust((x) => expect(x).toBe(1))
    })

    it('should not call a function', () => {
      expect.assertions(0)
      fromNullable(null).ifJust(() => expect(true).toBeFalsy())
    })
  })

  describe('ifNothing', () => {
    it('should not call a function', () => {
      expect.assertions(0)
      fromNullable(1).ifNothing(() => expect(true).toBeFalsy())
    })

    it('should call a function', () => {
      expect.assertions(1)
      fromNullable(null).ifNothing(() => expect(true).toBeTruthy())
    })
  })
})
