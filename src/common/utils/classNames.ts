// Simplified fork of clsx
// with limited support of input type.
// https://github.com/lukeed/clsx/blob/74cefa60314506f93a4db565c59152c6c0a2295c/src/index.js
// MIT Licensed https://github.com/lukeed/clsx/blob/74cefa60314506f93a4db565c59152c6c0a2295c/license

type Nullable<T> = T | null | undefined

type Item = Nullable<string | Record<string, Nullable<boolean>>>

export const classNames = (...items: Item[]): string => {
  let result = ''
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item != null) {
      if (typeof item === 'string') {
        if (result.length > 0) {
          result += ' '
        }
        result += item
      } else {
        for (const key in item) {
          if (item[key] === true) {
            if (result.length > 0) {
              result += ' '
            }
            result += key
          }
        }
      }
    }
  }
  return result
}
