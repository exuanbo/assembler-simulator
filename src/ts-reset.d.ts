// TODO: move to separate file
type WithRequired<T, K extends keyof T> = T & Omit<T, K> & Required<Pick<T, K>>

interface ObjectConstructor {
  hasOwn<T, K extends PropertyKey>(o: T, v: K):
    o is K extends keyof T
      ? WithRequired<T, K>
      : Extract<T, Record<K, unknown>>
}
