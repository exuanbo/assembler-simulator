import { useEffect } from 'react'
import { store } from './store'
import { applySelector } from './selector'
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
