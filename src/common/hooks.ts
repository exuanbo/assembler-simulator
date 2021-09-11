import { useReducer } from 'react'

export const useToggle = (initialState: boolean): [boolean, React.DispatchWithoutAction] =>
  useReducer((state: boolean) => !state, initialState)
