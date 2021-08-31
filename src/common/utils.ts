import { produce } from 'immer'

export type NullablePartial<T> = {
  [P in keyof T]?: T[P] | undefined
}

export type Head<T extends unknown[]> = T extends [...infer Head, unknown] ? Head : unknown[]

export const sign8 = (unsigned: number): number =>
  unsigned >= 0x80 ? unsigned - 0xff - 1 : unsigned

export const unsign8 = (signed: number): number => (signed < 0 ? signed + 0xff + 1 : signed)

export const hexToDec = (str: string): number => Number.parseInt(str, 16)

export const decToHex = (num: number): string => num.toString(16).padStart(2, '0').toUpperCase()

export const stringToASCII = (str: string): number[] =>
  str.split('').map(char => char.charCodeAt(0))

export const trimBrackets = (str: string): string => str.replace(/^\[(.*)]$/, '$1')

export const splitArrayPerChunk = <T>(arr: T[], perChunk: number): T[][] =>
  arr.reduce<T[][]>((res, val, index) => {
    const chunkIndex = Math.floor(index / perChunk)
    return produce(res, (draft: T[][]) => {
      draft[chunkIndex] = [...(draft[chunkIndex] ?? []), val]
    })
  }, [])

export const call = <T>(fn: () => T): T => fn()
