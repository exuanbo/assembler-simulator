const excludeUndefined = <T>(item: T | undefined): item is T => Boolean(item)

export default excludeUndefined
