export const hexToDec = (str: string): number => Number.parseInt(str, 16)

export const decToHex = (num: number): string => num.toString(16).padStart(2, '0').toUpperCase()

export const stringToASCII = (str: string): number[] =>
  str.split('').map(char => char.charCodeAt(0))

export const trimBrackets = (str: string): string => str.replace(/^\[(.*)]$/, '$1')

export const splitArrayPerChunk = (array: number[], perChunk: number): number[][] =>
  array.reduce<number[][]>((result, value, index) => {
    const chunkIndex = Math.floor(index / perChunk)
    result[chunkIndex] = result[chunkIndex]?.concat([value]) ?? [value]
    return result
  }, [])
