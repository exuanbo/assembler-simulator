import { useEffect } from 'react'
import { useStore } from './hooks'
import { subscribe } from './subscribe'
import { StateToPersist, selectStateToPersist } from './persist'
import { saveState as saveStateToUrl } from './url'
import { saveState as saveStateToLocalStorage } from './localStorage'

const saveState = (state: StateToPersist): void => {
  saveStateToUrl(state)
  saveStateToLocalStorage(state)
}

export const useStateSaver = (): void => {
  const store = useStore()

  useEffect(() => {
    const stateToPersist = selectStateToPersist(store.getState())
    saveState(stateToPersist)
    return subscribe(store.onState(selectStateToPersist), saveState)
  }, [])
}
