export const weakMemo = <Arg extends WeakKey, Result>(fn: (arg: Arg) => Result): typeof fn => {
  const cache = new WeakMap<Arg, Result>()
  return (arg) => {
    if (!cache.has(arg)) {
      cache.set(arg, fn(arg))
    }
    return cache.get(arg)!
  }
}
