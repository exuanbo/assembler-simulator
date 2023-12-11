export const sign8 = (unsigned: number): number =>
  unsigned >= 0x80 ? unsigned - 0xff - 1 : unsigned

export const unsign8 = (signed: number): number => (signed < 0 ? signed + 0xff + 1 : signed)

export const decToBin = (num: number): string => num.toString(2).padStart(8, '0')

export const decToHex = (num: number): string => num.toString(16).padStart(2, '0').toUpperCase()

export const decTo8bitBinDigits = (num: number): number[] => decToBin(num).split('').map(Number)

export const clamp = (num: number, min: number, max: number): number =>
  Math.min(Math.max(num, min), max)

export const hexToDec = (str: string): number => Number.parseInt(str, 16)

interface RangeFn {
  (stop: number): number[]
  (start: number, stop: number): number[]
}

export const range: RangeFn = (start: number, stop?: number): number[] => {
  const values: number[] = []
  if (stop === undefined) {
    stop = start
    start = 0
  }
  for (let value = start; value < stop; value++) {
    values.push(value)
  }
  return values
}

export const splitCamelCaseToString = (str: string): string => str.split(/(?=[A-Z])/).join(' ')

const BRACKETS_REGEXP = /^\[(.*)\]$/

export const trimBrackets = (str: string): string => str.replace(BRACKETS_REGEXP, '$1')

const BACKSLASHES_REGEXP = /\\/g

export const escapeBackslashes = (str: string): string => str.replace(BACKSLASHES_REGEXP, '\\\\')

const SINGLE_QUOTES_REGEXP = /'/g

const escapeSingleQuote = (str: string): string => str.replace(SINGLE_QUOTES_REGEXP, "\\'")

const SINGLE_QUOTED_STRING_REGEX = /'.*'/

export const escapeInnerSingleQuotes = (str: string): string => {
  const quotedPart = SINGLE_QUOTED_STRING_REGEX.exec(str)?.[0]
  return quotedPart === undefined
    ? str
    : str.replace(quotedPart, `'${escapeSingleQuote(quotedPart.slice(1, -1))}'`)
}

export const parseString = (str: string): string => parseStringRecursively(str.replace(/\\u/g, 'u'))

const parseStringRecursively = (str: string): string => {
  try {
    return JSON.parse(str)
  } catch (error) {
    if (error instanceof SyntaxError) {
      const charIndex = Number(error.message.split(' ').slice(-1)[0])
      // invalid escape character or number
      if (str[charIndex - 1] === '\\') {
        return parseStringRecursively(str.slice(0, charIndex - 1) + str.slice(charIndex))
      }
    }
    // istanbul ignore next
    throw error
  }
}

export const stringToAscii = (str: string): number[] =>
  str.split('').map((char) => char.charCodeAt(0))

export const arrayShallowEqual = (a: unknown[], b: unknown[]): boolean => {
  if (b.length !== a.length) {
    return false
  }
  const elementCount = b.length
  for (let elementIndex = 0; elementIndex < elementCount; elementIndex++) {
    if (b[elementIndex] !== a[elementIndex]) {
      return false
    }
  }
  return true
}

export const chunk = <T>(size: number, arr: T[]): T[][] => {
  const chunks: T[][] = []
  const elementCount = arr.length
  for (let elementIndex = 0; elementIndex < elementCount; elementIndex += size) {
    chunks.push(arr.slice(elementIndex, elementIndex + size))
  }
  return chunks
}

export const asciiToChars = (arr: number[]): string[] => arr.map((num) => String.fromCharCode(num))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FunctionType = (...args: any[]) => any

export const isFunction = (value: unknown): value is FunctionType => typeof value === 'function'

export const noop = (): void => {}

export const call = <T>(fn: () => T): T => fn()

// TODO: type more precisely
export const ary =
  <T extends unknown[], R>(fn: (...args: T) => R, arity: number) =>
  (...args: T): R =>
    fn(...(args.slice(0, arity) as T))

export const curryRight2 =
  <T1, T2, R>(fn: (arg1: T1, arg2: T2) => R) =>
  (arg2: T2) =>
  (arg1: T1): R =>
    fn(arg1, arg2)

export const throttle = <T extends unknown[]>(
  fn: (...args: T) => unknown,
  wait: number,
): ((...args: T) => void) => {
  let lastTime: number | undefined
  let queuedTimeoutId: number | undefined

  return function invokeFn(...args) {
    window.clearTimeout(queuedTimeoutId)

    const currentTime = Date.now()
    if (lastTime === undefined || currentTime - lastTime >= wait) {
      fn(...args)
      lastTime = currentTime
    } else {
      queuedTimeoutId = window.setTimeout(
        () => {
          invokeFn(...args)
        },
        wait - (currentTime - lastTime),
      )
    }
  }
}
