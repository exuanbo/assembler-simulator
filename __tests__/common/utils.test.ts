import {
  decToBin,
  decTo8bitBinDigits,
  clamp,
  range,
  splitCamelCaseToString,
  asciiToChars,
  compareArrayWithSameLength,
  curryRight2,
  throttle,
  merge
} from '@/common/utils'

describe('utils', () => {
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

  // modified from https://github.com/mesqueeb/merge-anything/blob/e492bfc05b2b333a5c6316e0dbc8953752eafe07/test/index.test.ts
  describe('merge', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    test('1. origin & target stays the same | 2. works with dates', () => {
      const nd = new Date()
      const origin = { body: 'a' }
      const target = { dueDate: nd }
      const res = merge(origin, target)
      expect(res).toEqual({ body: 'a', dueDate: nd })
      expect(origin).toEqual({ body: 'a' })
      expect(target).toEqual({ dueDate: nd })
    })
    test('adding a prop on target1|target2|mergedObj', () => {
      const origin = { nested: {} }
      const target = { nested: {} }
      const res = merge(origin, target)
      expect(res).toEqual({ nested: {} })
      const originAsAny: any = origin
      const targetAsAny: any = target
      const resAsAny: any = res
      originAsAny.nested.a = ''
      targetAsAny.nested.b = ''
      resAsAny.nested.c = ''
      expect(originAsAny).toEqual({ nested: { a: '' } })
      expect(targetAsAny).toEqual({ nested: { b: '' } })
      expect(res).toEqual({ nested: { c: '' } })
    })
    test('changing a prop on target1|target2|mergedObj: failing example', () => {
      const origin = { nested: { a: 1 } }
      const target = {}
      const res = merge(origin, target)
      expect(res).toEqual({ nested: { a: 1 } })
      origin.nested.a = 2
      expect(origin).toEqual({ nested: { a: 2 } }) // linked
      expect(target).toEqual({})
      expect(res).toEqual({ nested: { a: 2 } }) // linked
      const targetAsAny: any = target
      targetAsAny.nested = { a: 3 }
      expect(origin).toEqual({ nested: { a: 2 } }) // not changed
      expect(targetAsAny).toEqual({ nested: { a: 3 } })
      expect(res).toEqual({ nested: { a: 2 } }) // not changed
      res.nested.a = 4
      expect(origin).toEqual({ nested: { a: 4 } }) // linked
      expect(targetAsAny).toEqual({ nested: { a: 3 } })
      expect(res).toEqual({ nested: { a: 4 } }) // linked
    })
    test('changing a prop on target1|target2|mergedObj: working example', () => {
      const origin = { nested: { a: 1 } }
      const target = {}
      const merged = merge(origin, target)
      const res = JSON.parse(JSON.stringify(merged))
      expect(res).toEqual({ nested: { a: 1 } })
      origin.nested.a = 2
      expect(origin).toEqual({ nested: { a: 2 } }) // not linked
      expect(target).toEqual({})
      expect(res).toEqual({ nested: { a: 1 } }) // not linked
      const targetAsAny: any = target
      targetAsAny.nested = { a: 3 }
      expect(origin).toEqual({ nested: { a: 2 } }) // not changed
      expect(targetAsAny).toEqual({ nested: { a: 3 } })
      expect(res).toEqual({ nested: { a: 1 } }) // not changed
      res.nested.a = 4
      expect(origin).toEqual({ nested: { a: 2 } }) // not linked
      expect(targetAsAny).toEqual({ nested: { a: 3 } })
      expect(res).toEqual({ nested: { a: 4 } }) // not linked
    })
    test('1. works with multiple levels | 2. overwrites entire object with null', () => {
      const origin = { body: '', head: null, toes: { big: true }, fingers: { '12': false } }
      const target = { body: {}, head: {}, toes: {}, fingers: null }
      const res = merge(origin, target)
      expect(res).toEqual({ body: {}, head: {}, toes: { big: true }, fingers: null })
    })
    test('origin and target are not AsAny', () => {
      const origin = { body: '', head: null, toes: { big: true }, fingers: { '12': false } }
      const target = { body: {}, head: {}, toes: {}, fingers: null }
      const res = merge(origin, target)
      expect(res).toEqual({ body: {}, head: {}, toes: { big: true }, fingers: null })
      expect(origin).toEqual({ body: '', head: null, toes: { big: true }, fingers: { '12': false } }) // prettier-ignore
      expect(target).toEqual({ body: {}, head: {}, toes: {}, fingers: null })
      origin.body = 'a'
      const originAsAny: any = origin
      const targetAsAny: any = target
      originAsAny.head = 'a'
      originAsAny.toes.big = 'a'
      originAsAny.fingers['12'] = 'a'
      targetAsAny.body = 'b'
      targetAsAny.head = 'b'
      targetAsAny.toes = 'b'
      targetAsAny.fingers = 'b'
      expect(res).toEqual({ body: {}, head: {}, toes: { big: true }, fingers: null })
      expect(originAsAny).toEqual({ body: 'a', head: 'a', toes: { big: 'a' }, fingers: { '12': 'a' } }) // prettier-ignore
      expect(targetAsAny).toEqual({ body: 'b', head: 'b', toes: 'b', fingers: 'b' })
    })
    test('Overwrite arrays', () => {
      const origin = { array: ['a'] }
      const target = { array: ['b'] }
      const res = merge(origin, target)
      expect(res).toEqual({ array: ['b'] })
    })
    test('overwrites null with empty object', () => {
      const origin = { body: null }
      const target = { body: {} }
      const res = merge(origin, target)
      expect(res).toEqual({ body: {} })
    })
    test('overwrites null with object with props', () => {
      const origin = { body: null }
      const target = { body: { props: true } }
      const res = merge(origin, target)
      expect(res).toEqual({ body: { props: true } })
    })
    test('overwrites string values', () => {
      const origin = { body: 'a' }
      const target = { body: 'b' }
      const res = merge(origin, target)
      expect(res).toEqual({ body: 'b' })
      expect(origin).toEqual({ body: 'a' })
      expect(target).toEqual({ body: 'b' })
    })
    test('works with very deep props & dates', () => {
      const newDate = new Date()
      const origin = { info: { time: 'now', newDate, very: { deep: { prop: false } } } }
      const target = { info: { date: 'tomorrow', very: { deep: { prop: true } } } }
      const res = merge(origin, target)
      expect(res).toEqual({ info: { time: 'now', newDate, date: 'tomorrow', very: { deep: { prop: true } } } }) // prettier-ignore
      expect(origin).toEqual({ info: { time: 'now', newDate, very: { deep: { prop: false } } } })
      expect(target).toEqual({ info: { date: 'tomorrow', very: { deep: { prop: true } } } })
      expect(res.info.newDate instanceof Date).toEqual(true)
    })
    test('1. does not overwrite origin prop if target prop is an empty object | 2. properly merges deep props', () => {
      const origin = { info: { time: { when: 'now' }, very: { deep: { prop: false } } } }
      const target = { info: { time: {}, very: { whole: 1 } } }
      const res = merge(origin, target)
      expect(res).toEqual({ info: { time: { when: 'now' }, very: { deep: { prop: false }, whole: 1 } } }) // prettier-ignore
    })
    test('overwrites any origin prop when target prop is an object with props', () => {
      const origin = { body: 'a', body2: { head: false }, tail: {} }
      const target = { body: { head: true }, body2: { head: { eyes: true } } }
      const res = merge(origin, target)
      expect(res).toEqual({ body: { head: true }, body2: { head: { eyes: true } }, tail: {} })
      expect(origin).toEqual({ body: 'a', body2: { head: false }, tail: {} })
      expect(target).toEqual({ body: { head: true }, body2: { head: { eyes: true } } })
    })

    test('works with unlimited depth', () => {
      const date = new Date()
      const origin = { origin: 'a', t2: false, t3: {}, t4: 'false' }
      const t1 = { t1: date }
      const t2 = { t2: 'new' }
      const t3 = { t3: 'new' }
      const t4 = { t4: 'new', t3: {} }
      const res = merge(origin, t1, t2, t3, t4)
      expect(res).toEqual({ origin: 'a', t1: date, t2: 'new', t3: {}, t4: 'new' })
      expect(origin).toEqual({ origin: 'a', t2: false, t3: {}, t4: 'false' })
      expect(t1).toEqual({ t1: date })
      expect(t2).toEqual({ t2: 'new' })
      expect(t3).toEqual({ t3: 'new' })
      expect(t4).toEqual({ t4: 'new', t3: {} })
    })

    test('symbols as keys 1', () => {
      const mySymbol = Symbol('mySymbol')
      const x = { value: 42, [mySymbol]: 'hello' }
      const y = { other: 33 }
      const res = merge(x, y)
      expect(res.value).toEqual(42)
      expect(res.other).toEqual(33)
      expect(res[mySymbol]).toEqual('hello')
    })
    test('symbols as keys 2', () => {
      const mySymbol = Symbol('mySymbol')
      const x = { value: 42 }
      const y = { other: 33, [mySymbol]: 'hello' }
      const res = merge(x, y)
      expect(res.value).toEqual(42)
      expect(res.other).toEqual(33)
      expect(res[mySymbol]).toEqual('hello')
    })

    test('readme', () => {
      const starter = { name: 'Squirtle', types: { water: true } }
      const newValues = { name: 'Wartortle', types: { fighting: true }, level: 16 }
      const evolution = merge(starter, newValues, { is: 'cool' })
      expect(evolution).toEqual({ name: 'Wartortle', types: { water: true, fighting: true }, level: 16, is: 'cool' }) // prettier-ignore
    })
    /* eslint-enable @typescript-eslint/no-explicit-any */
  })
})
