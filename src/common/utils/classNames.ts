// Simplified fork of clsx
// with limited support of input type.
// https://github.com/lukeed/clsx/blob/74cefa60314506f93a4db565c59152c6c0a2295c/src/index.js
// MIT Licensed https://github.com/lukeed/clsx/blob/74cefa60314506f93a4db565c59152c6c0a2295c/license

type Nullable<T> = T | null | undefined

type Item = Nullable<string | Record<string, Nullable<boolean>>>

export const classNames = (...items: Item[]): string => {
  let className = ''
  const itemCount = items.length
  for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
    const item = items[itemIndex]
    if (item != null) {
      if (typeof item === 'string') {
        if (className.length > 0) {
          className += ' '
        }
        className += item
      } else {
        for (const key in item) {
          if (item[key] === true) {
            if (className.length > 0) {
              className += ' '
            }
            className += key
          }
        }
      }
    }
  }
  return className
}
