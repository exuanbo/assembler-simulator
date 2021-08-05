export const hexToDec = (str: string): number => Number.parseInt(str, 16)

export const decToHex = (num: number): string => num.toString(16).padStart(2, '0').toUpperCase()

export const stringToASCII = (str: string): number[] =>
  str.split('').map(char => char.charCodeAt(0))

export const trimBrackets = (str: string): string => str.replace(/^\[(.*)]$/, '$1')

export const splitUint8ArrayPerChunk = (arr: Uint8Array, perChunk: number): number[][] =>
  arr.reduce<number[][]>((matrix, value, index) => {
    const chunkIndex = Math.floor(index / perChunk)
    matrix[chunkIndex] = matrix[chunkIndex] ?? []
    matrix[chunkIndex].push(value)
    return matrix
  }, [])
