export { merge } from './merge'

/**
 * Modified from <https://stackoverflow.com/a/57683652/13346012>
 */
export type ExpandDeep<T> = T extends Record<string, unknown>
  ? { [K in keyof T]: ExpandDeep<T[K]> }
  : T extends Array<infer E>
  ? Array<ExpandDeep<E>>
  : T

export type ExcludeTupleTail<T extends unknown[]> = T extends [...infer Excluded, unknown]
  ? Excluded
  : []

type UnionToFunctionWithUnionAsArg<Union> = (arg: Union) => void

type UnionToFunctionIntersectionWithUnionMemberAsArg<Union> = (
  Union extends never ? never : (arg: UnionToFunctionWithUnionAsArg<Union>) => void
) extends (arg: infer ArgAsFunctionIntersection) => void
  ? ArgAsFunctionIntersection
  : never

/**
 * Modified from <https://github.com/microsoft/TypeScript/issues/13298#issuecomment-885980381>
 */
export type UnionToTuple<Union> = UnionToFunctionIntersectionWithUnionMemberAsArg<Union> extends (
  a: infer ArgAsLastUnionMember
) => void
  ? [...UnionToTuple<Exclude<Union, ArgAsLastUnionMember>>, ArgAsLastUnionMember]
  : []

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
  if (stop === undefined) {
    stop = start
    start = 0
  }
  return Array.from({ length: stop - start }, (_, index) => start + index)
}

export const splitCamelCaseToString = (str: string): string => str.split(/(?=[A-Z])/).join(' ')

const PART_INSIDE_BRACKETS_OR_QUOTES_REGEXP = /^[["](.*)["\]]$/

export const trimBracketsAndQuotes = (str: string): string =>
  str.replace(PART_INSIDE_BRACKETS_OR_QUOTES_REGEXP, '$1')

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

export const stringToAscii = (str: string): number[] =>
  str.split('').map(char => char.charCodeAt(0))

export const asciiToChars = (arr: number[]): string[] => arr.map(num => String.fromCharCode(num))

export const compareArrayWithSameLength = <T>(a: T[], b: T[]): boolean =>
  a.every((value, index) => value === b[index])

export const chunk = <T>(size: number, arr: T[]): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

// istanbul ignore next
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {}

export const call = <T>(fn: () => T): T => fn()

export const curryRight2 =
  <T1, T2, R>(fn: (arg1: T1, arg2: T2) => R) =>
  (arg2: T2) =>
  (arg1: T1): R =>
    fn(arg1, arg2)

export const throttle = <T extends unknown[]>(
  fn: (...args: T) => unknown,
  wait: number
): ((...args: T) => void) => {
  let lastTime: number | undefined
  let queuedTimeoutId: number | undefined

  return function invokeFn(...args: T) {
    const now = Date.now()

    if (queuedTimeoutId !== undefined) {
      window.clearTimeout(queuedTimeoutId)
      queuedTimeoutId = undefined
    }

    if (lastTime === undefined || now - lastTime >= wait) {
      fn(...args)
      lastTime = now
    } else {
      queuedTimeoutId = window.setTimeout(() => {
        invokeFn(...args)
      }, wait - (now - lastTime))
    }
  }
}

// istanbul ignore next
export const errorToPlainObject = ({ name, message, stack }: Error): Error => {
  return { name, message, stack }
}
