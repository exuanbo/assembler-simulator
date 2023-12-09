import type { PlainObject } from '@/common/utils'

type Persisted<State> = State | Record<string, never>

export interface PersistenceProvider<State extends PlainObject = PlainObject> {
  read: () => Persisted<State>
  write: (state: State) => void
}
