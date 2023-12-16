type WeakCache<K extends WeakKey> = <V>(key: K, createValue: () => V) => V

export const createWeakCache = <K extends WeakKey>(): WeakCache<K> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values = new WeakMap<K, any>()

  return (key, createValue) => {
    let value = values.get(key)
    if (!value) {
      value = createValue()
      values.set(key, value)
    }
    return value
  }
}
