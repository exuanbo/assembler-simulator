import * as Base64 from 'js-base64'
import { gzip, ungzip } from 'pako'
import type { StateToPersist, PersistedState } from './selectors'

const QUERY_PARAMETER_NAME = 'shareable'

export const loadState = (): PersistedState => {
  const url = new URL(window.location.href)
  const encodedState = url.searchParams.get(QUERY_PARAMETER_NAME)
  if (encodedState !== null) {
    try {
      const data = Base64.toUint8Array(encodedState)
      const decodedState = ungzip(data, { to: 'string' })
      return JSON.parse(decodedState)
    } catch {
      // ignore error
    }
  }
  return {}
}

const getShareUrl = (state: StateToPersist): string => {
  const url = new URL(window.location.href)
  const data = gzip(JSON.stringify(state))
  const encodedState = Base64.fromUint8Array(data, /* urlsafe: */ true)
  url.searchParams.set(QUERY_PARAMETER_NAME, encodedState)
  return url.toString()
}

export const saveState = (state: StateToPersist): void => {
  const shareUrl = getShareUrl(state)
  window.history.replaceState({}, '', shareUrl)
}
