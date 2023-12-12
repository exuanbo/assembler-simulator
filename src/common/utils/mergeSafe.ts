import { isPlainObject, isSameType, type PlainObject } from './common'

const mergeSafeRecursive = <Target>(target: Target, source: unknown): Target => {
  if (!isSameType(target, source)) {
    return target
  }
  // source is guaranteed to be a plain object here but TypeScript doesn't know that
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return source
  }
  const result: PlainObject = {}
  const targetPropertyNames = Object.getOwnPropertyNames(target)
  const targetPropertySymbols = Object.getOwnPropertySymbols(target)
  const sourcePropertyNames = Object.getOwnPropertyNames(source)
  const sourcePropertySymbols = Object.getOwnPropertySymbols(source)
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
  const assignSourceProperty = (key: string | symbol): void => {
    const isKeySymbol = typeof key === 'symbol'
    if (
      (!isKeySymbol && targetPropertyNames.includes(key)) ||
      (isKeySymbol && targetPropertySymbols.includes(key))
    ) {
      const targetPropertyValue = target[key]
      const sourcePropertyValue: unknown = source[key]
      Object.defineProperty(result, key, {
        ...Object.getOwnPropertyDescriptor(target, key),
        value: mergeSafeRecursive(targetPropertyValue, sourcePropertyValue),
      })
    }
  }
  sourcePropertyNames.forEach(assignSourceProperty)
  sourcePropertySymbols.forEach(assignSourceProperty)
  return result
}

export const mergeSafe = <Target, Sources extends unknown[]>(
  target: Target,
  ...sources: Sources
): Target => sources.reduce<Target>(mergeSafeRecursive, target)
