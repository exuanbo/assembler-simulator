// Simplified fork of merge-anything
// https://github.com/mesqueeb/merge-anything/blob/e492bfc05b2b333a5c6316e0dbc8953752eafe07/src/merge.ts
// MIT Licensed https://github.com/mesqueeb/merge-anything/blob/e492bfc05b2b333a5c6316e0dbc8953752eafe07/LICENSE

import type { Object as ObjectTypeUtils } from 'ts-toolbelt'

const getType = (value: unknown): string => Object.prototype.toString.call(value).slice(8, -1)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PlainObject = Record<string | number | symbol, any>

const isPlainObject = (value: unknown): value is PlainObject => getType(value) === 'Object'

const mergeRecursively = (target: unknown, source: PlainObject): PlainObject => {
  const resultObject: PlainObject = {}
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
        Object.defineProperty(resultObject, key, {
          ...Object.getOwnPropertyDescriptor(target, key)
        })
      }
    }
    targetPropertyNames.forEach(assignTargetProperty)
    targetPropertySymbols.forEach(assignTargetProperty)
  }
  const assignSourceProperty = (key: string | symbol): void => {
    const sourcePropertyValue = source[key]
    const shouldMerge = isTargetPlainObject && isPlainObject(sourcePropertyValue)
    if (shouldMerge) {
      const targetPropertyValue = target[key]
      Object.defineProperty(resultObject, key, {
        ...Object.getOwnPropertyDescriptor(source, key),
        value: mergeRecursively(targetPropertyValue, sourcePropertyValue)
      })
    } else {
      Object.defineProperty(resultObject, key, {
        ...Object.getOwnPropertyDescriptor(source, key)
      })
    }
  }
  sourcePropertyNames.forEach(assignSourceProperty)
  sourcePropertySymbols.forEach(assignSourceProperty)
  return resultObject
}

// Modified from an answer to the question
// "How can I see the full expanded contract of a Typescript type?"
// https://stackoverflow.com/a/57683652/13346012
type ExpandDeep<T> = T extends Record<string | number | symbol, unknown>
  ? { [K in keyof T]: ExpandDeep<T[K]> }
  : T extends Array<infer E>
  ? Array<ExpandDeep<E>>
  : T

export const merge = <TTarget extends PlainObject, TSources extends PlainObject[]>(
  target: TTarget,
  ...sources: TSources
): ExpandDeep<ObjectTypeUtils.Assign<TTarget, TSources, 'deep'>> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sources.reduce<any>((resultObject, source) => mergeRecursively(resultObject, source), target)
