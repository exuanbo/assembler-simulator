const excludeUndefined = <T>(item: T | undefined): item is T =>
  item !== undefined

export default excludeUndefined
