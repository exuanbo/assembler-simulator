import type { Subject } from 'rxjs'

export type AsObservable<T extends Subject<unknown>> = Omit<T, 'next' | 'error' | 'complete'>

export function asObservable<T extends Subject<unknown>>(subject: T): AsObservable<T> {
  return subject
}
