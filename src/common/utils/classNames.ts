// Simplified fork of clsx
// with limited support of input type.
// https://github.com/lukeed/clsx/blob/74cefa60314506f93a4db565c59152c6c0a2295c/src/index.js
// MIT Licensed https://github.com/lukeed/clsx/blob/74cefa60314506f93a4db565c59152c6c0a2295c/license

import type { Nullable } from './types'

type Item = Nullable<string | Record<string, Nullable<boolean>>>

export const classNames = (...items: Item[]): string => {
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
    } else {
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
