type WeakCache<K extends WeakKey, V> = (key: K, createValue: () => V) => V

export const createWeakCache = <K extends WeakKey, V>(): WeakCache<K, V> => {
  const cache = new WeakMap<K, V>()

  return (key, createValue) => {
    let value = cache.get(key)
    if (!value) {
      value = createValue()
      cache.set(key, value)
    }
    return value
  }
}
