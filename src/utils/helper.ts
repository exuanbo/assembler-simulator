export const excludeUndefined = <T>(item: T | undefined): item is T =>
  item !== undefined

export const decToHex = (num: number): string =>
  num.toString(16).padStart(2, '0').toUpperCase()
