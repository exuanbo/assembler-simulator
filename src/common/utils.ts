export type ExcludeTupleTail<T extends unknown[]> = T extends [...infer Excluded, unknown]
  ? Excluded
  : []

type UnionToFunctionWithUnionAsArg<Union> = (a: Union) => void

type UnionToFunctionIntersectionWithUnionMemberAsArg<Union> = (
  Union extends never ? never : (a: UnionToFunctionWithUnionAsArg<Union>) => void
) extends (a: infer ArgAsFunctionIntersection) => void
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

export const hexToDec = (str: string): number => Number.parseInt(str, 16)

export const decToHex = (num: number): string => num.toString(16).padStart(2, '0').toUpperCase()

export const trimBracketsAndQuotes = (str: string): string => str.replace(/^[["](.*)["\]]$/, '$1')

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

export const stringToAscii = (str: string): number[] =>
  str.split('').map(char => char.charCodeAt(0))

export const asciiToChars = (arr: number[]): string[] => arr.map(num => String.fromCharCode(num))

export const chunk = <T>(size: number, arr: T[]): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

export const call = <T>(fn: () => T): T => fn()

export const curry2 =
  <T1, T2, R>(fn: (t1: T1, t2: T2) => R) =>
  (t1: T1) =>
  (t2: T2): R =>
    fn(t1, t2)
