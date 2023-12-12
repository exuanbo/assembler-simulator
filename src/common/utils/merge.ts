// Simplified fork of merge-anything
// https://github.com/mesqueeb/merge-anything/blob/e492bfc05b2b333a5c6316e0dbc8953752eafe07/src/merge.ts
// MIT Licensed https://github.com/mesqueeb/merge-anything/blob/e492bfc05b2b333a5c6316e0dbc8953752eafe07/LICENSE

import type { O } from 'ts-toolbelt'

import { isPlainObject, type PlainObject } from './common'

const mergeRecursively = (target: unknown, source: PlainObject): PlainObject => {
  const result: PlainObject = {}
  const sourcePropertyNames = Object.getOwnPropertyNames(source)
  const sourcePropertySymbols = Object.getOwnPropertySymbols(source)
  const isTargetPlainObject = isPlainObject(target)
  if (isTargetPlainObject) {
    const targetPropertyNames = Object.getOwnPropertyNames(target)
    const targetPropertySymbols = Object.getOwnPropertySymbols(target)
    const assignTargetProperty = (key: string | symbol): void => {
      const isKeySymbol = typeof key === 'symbol'
      if (
        (!isKeySymbol && !sourcePropertyNames.includes(key)) ||
        (isKeySymbol && !sourcePropertySymbols.includes(key))
      ) {
        Object.defineProperty(result, key, Object.getOwnPropertyDescriptor(target, key)!)
      }
    }
    targetPropertyNames.forEach(assignTargetProperty)
    targetPropertySymbols.forEach(assignTargetProperty)
  }
  const assignSourceProperty = (key: string | symbol): void => {
    const sourcePropertyValue = source[key]
    const shouldMerge = isTargetPlainObject && isPlainObject(sourcePropertyValue)
    if (shouldMerge) {
      const targetPropertyValue: unknown = target[key]
      Object.defineProperty(result, key, {
        ...Object.getOwnPropertyDescriptor(source, key),
        value: mergeRecursively(targetPropertyValue, sourcePropertyValue),
      })
    } else {
      Object.defineProperty(result, key, Object.getOwnPropertyDescriptor(source, key)!)
    }
  }
  sourcePropertyNames.forEach(assignSourceProperty)
  sourcePropertySymbols.forEach(assignSourceProperty)
  return result
}

// https://stackoverflow.com/a/57683652/13346012
type ExpandDeep<T> = T extends Record<PropertyKey, unknown>
  ? { [K in keyof T]: ExpandDeep<T[K]> }
  : T extends Array<infer E>
    ? Array<ExpandDeep<E>>
    : T

export const merge = <Target extends PlainObject, Sources extends PlainObject[] = Target[]>(
  target: Target,
  ...sources: Sources
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ExpandDeep<O.Assign<Target, Sources, 'deep'>> => sources.reduce<any>(mergeRecursively, target)
