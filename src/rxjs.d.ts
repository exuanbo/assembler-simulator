import type { MonoTypeOperatorFunction } from 'rxjs'

declare module 'rxjs' {
  export function filter<T>(predicate: (value: T, index: number) => unknown): MonoTypeOperatorFunction<T>
  export function skipWhile<T>(predicate: (value: T, index: number) => unknown): MonoTypeOperatorFunction<T>
}
