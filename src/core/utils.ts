export const hexToDec = (str: string): number => Number.parseInt(str, 16)

export const decToHex = (num: number): string => num.toString(16).padStart(2, '0').toUpperCase()

export const stringToASCII = (str: string): number[] =>
  str.split('').map(char => char.charCodeAt(0))

export const normalizeType = (type: string): string => type.toLowerCase().split('_').join(' ')

export const splitUint8ArrayPerChunk = (arr: Uint8Array, perChunk: number): number[][] =>
  arr.reduce((resArr: number[][], item, itemIndex) => {
    const chunkIndex = Math.floor(itemIndex / perChunk)
    resArr[chunkIndex] = resArr[chunkIndex] ?? []
    resArr[chunkIndex].push(item)
    return resArr
  }, [])
