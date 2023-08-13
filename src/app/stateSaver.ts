import { useEffect } from 'react'
import { store, applySelector } from './store'
import { subscribe } from './subscribe'
import { StateToPersist, selectStateToPersist } from './persist'
import { saveState as saveStateToUrl } from './url'
import { saveState as saveStateToLocalStorage } from './localStorage'

const saveState = (state: StateToPersist): void => {
  saveStateToUrl(state)
  saveStateToLocalStorage(state)
}

export const useStateSaver = (): void => {
  useEffect(() => {
    const stateToPersist = applySelector(selectStateToPersist)
    saveState(stateToPersist)
    return subscribe(store.onState(selectStateToPersist), saveState)
  }, [])
}
