export interface PersistenceProvider<State> {
  read: () => State
  write: (state: State) => void
}

export type PersistenceValidator<State> = (state: unknown) => state is State

export type PersistenceProviderCreator = <State>(
  validate: PersistenceValidator<State>,
  fallback: State,
) => PersistenceProvider<State>
