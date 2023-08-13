import type { Observable, Observer, Subscription } from 'rxjs'

export type Unsubscribe = Subscription['unsubscribe']

export const subscribe = <T>(
  observable: Observable<T>,
  observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null
): Unsubscribe => {
  const subscription = observable.subscribe(observerOrNext)
  return () => subscription.unsubscribe()
}
