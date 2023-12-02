import { useEffect } from 'react'

import { saveState as saveStateToLocalStorage } from './localStorage'
import { selectStateToPersist, StateToPersist } from './persist'
import { applySelector } from './selector'
import { store } from './store'
import { subscribe } from './subscribe'
import { saveState as saveStateToUrl } from './url'

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
