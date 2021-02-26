export const excludeUndefined = <T>(item: T | undefined): item is T =>
  item !== undefined

export const decToHex = (num: number): string =>
  num.toString(16).padStart(2, '0').toUpperCase()

export const splitUint8ArrayPerChunk = (
  arr: Uint8Array,
  perChunk: number
): number[][] =>
  arr.reduce((resArr: number[][], item, itemIndex) => {
    const chunkIndex = Math.floor(itemIndex / perChunk)
    if (resArr[chunkIndex] === undefined) {
      resArr[chunkIndex] = []
    }
    resArr[chunkIndex].push(item)
    return resArr
  }, [])
