import { useEffect } from 'react'

import { saveState as saveStateToLocalStorage } from './localStorage'
import { selectStateToPersist, type StateToPersist } from './persist'
import { store } from './store'
import { subscribe } from './subscribe'
import { saveState as saveStateToUrl } from './url'

const saveState = (state: StateToPersist): void => {
  saveStateToUrl(state)
  saveStateToLocalStorage(state)
}

export const useStateSaver = (): void => {
  useEffect(() => {
    const stateToPersist$ = store.onState(selectStateToPersist, { initial: true })
    return subscribe(stateToPersist$, saveState)
  }, [])
}
