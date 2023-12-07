type WeakCache<K extends WeakKey> = <V>(key: K, createValue: () => V) => V

export const createWeakCache = <K extends WeakKey>(): WeakCache<K> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cache = new WeakMap<K, any>()

  return (key, createValue) => {
    let value = cache.get(key)
    if (!value) {
      value = createValue()
      cache.set(key, value)
    }
    return value
  }
}
