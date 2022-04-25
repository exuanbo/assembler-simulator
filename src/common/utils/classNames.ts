// Simplified fork of clsx
// with limited support of input type.
// https://github.com/lukeed/clsx/blob/74cefa60314506f93a4db565c59152c6c0a2295c/src/index.js
// MIT Licensed https://github.com/lukeed/clsx/blob/74cefa60314506f93a4db565c59152c6c0a2295c/license

type Nullable<T> = T | null | undefined

type Argument = Nullable<string | Record<string, Nullable<boolean>>>

export const classNames = (...args: Argument[]): string => {
  let result = ''
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg != null) {
      if (typeof arg === 'string') {
        if (result.length > 0) {
          result += ' '
        }
        result += arg
      } else {
        for (const key in arg) {
          if (arg[key] === true) {
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
