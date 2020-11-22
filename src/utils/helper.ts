export const excludeUndefined = <T>(item: T | undefined): item is T =>
  item !== undefined

export const decToHex = (num: number): string =>
  num.toString(16).padStart(2, '0').toUpperCase()

export const splitPerChunk = <T>(arr: T[], perChunk: number): T[][] =>
  arr.reduce((resArr: T[][], item, index) => {
    const chunkIndex = Math.floor(index / perChunk)
    if (resArr[chunkIndex] === undefined) {
      resArr[chunkIndex] = []
    }
    resArr[chunkIndex].push(item)
    return resArr
  }, [])
