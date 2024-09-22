// Simplified fork of clsx
// with limited support of input type.
// https://github.com/lukeed/clsx/blob/74cefa60314506f93a4db565c59152c6c0a2295c/src/index.js
// MIT Licensed https://github.com/lukeed/clsx/blob/74cefa60314506f93a4db565c59152c6c0a2295c/license

import type { Nullable } from './types'

export type ClassItem = Nullable<string | Record<string, Nullable<boolean>> | false>

export const classNames = (...items: ClassItem[]): string => {
  let className = ''
  const count = items.length
  for (let index = 0; index < count; index++) {
    const item = items[index]
    if (!item) {
      continue
    }
    if (typeof item === 'string') {
      className && (className += ' ')
      className += item
    }
    else {
      for (const key in item) {
        if (item[key]) {
          className && (className += ' ')
          className += key
        }
      }
    }
  }
  return className
}

const stringToRecord = (item: string) => {
  const record: Record<string, true> = {}
  const keys = item.split(' ')
  const count = keys.length
  for (let index = 0; index < count; index++) {
    const key = keys[index]
    if (key) {
      record[key] = true
    }
  }
  return record
}

export const mergeClassNames = (target: ClassItem, source: ClassItem): string => {
  if (!target) {
    return classNames(source)
  }
  if (!source) {
    return classNames(target)
  }
  if (typeof target === 'string') {
    return mergeClassNames(stringToRecord(target), source)
  }
  if (typeof source === 'string') {
    return mergeClassNames(target, stringToRecord(source))
  }
  return classNames({ ...target, ...source })
}
