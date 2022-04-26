// Copied from merge-anything with newlines removed.
// https://github.com/mesqueeb/merge-anything/blob/e492bfc05b2b333a5c6316e0dbc8953752eafe07/test/index.test.ts
// MIT Licensed https://github.com/mesqueeb/merge-anything/blob/e492bfc05b2b333a5c6316e0dbc8953752eafe07/LICENSE

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */

import { merge } from '@/common/utils'

describe('merge', () => {
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
    expect(origin).toEqual({ body: '', head: null, toes: { big: true }, fingers: { '12': false } })
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
    expect(originAsAny).toEqual({ body: 'a', head: 'a', toes: { big: 'a' }, fingers: { '12': 'a' } })
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
    expect(res).toEqual({ info: { time: 'now', newDate, date: 'tomorrow', very: { deep: { prop: true } } } })
    expect(origin).toEqual({ info: { time: 'now', newDate, very: { deep: { prop: false } } } })
    expect(target).toEqual({ info: { date: 'tomorrow', very: { deep: { prop: true } } } })
    expect(res.info.newDate instanceof Date).toEqual(true)
  })
  test('1. does not overwrite origin prop if target prop is an empty object | 2. properly merges deep props', () => {
    const origin = { info: { time: { when: 'now' }, very: { deep: { prop: false } } } }
    const target = { info: { time: {}, very: { whole: 1 } } }
    const res = merge(origin, target)
    expect(res).toEqual({ info: { time: { when: 'now' }, very: { deep: { prop: false }, whole: 1 } } })
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
    expect(evolution).toEqual({ name: 'Wartortle', types: { water: true, fighting: true }, level: 16, is: 'cool' })
  })
})
