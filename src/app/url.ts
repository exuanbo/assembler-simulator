import * as Base64 from 'js-base64'
import { deflate, inflate } from 'pako'
import type { StateToPersist, PersistedState } from './persist'

const QUERY_PARAMETER_NAME = 'shareable'

export const loadState = (): PersistedState => {
  const url = new URL(window.location.href)
  const encodedState = url.searchParams.get(QUERY_PARAMETER_NAME)
  if (encodedState !== null) {
    try {
      const compressedData = Base64.toUint8Array(encodedState)
      const decodedState = inflate(compressedData, { to: 'string' })
      return JSON.parse(decodedState)
    } catch {
      // ignore error
    }
  }
  return {}
}

const getShareUrl = (state: StateToPersist): string => {
  const url = new URL(window.location.href)
  const compressedData = deflate(JSON.stringify(state))
  const encodedState = Base64.fromUint8Array(compressedData, /* urlsafe: */ true)
  url.searchParams.set(QUERY_PARAMETER_NAME, encodedState)
  return url.toString()
}

export const saveState = (state: StateToPersist): void => {
  const shareUrl = getShareUrl(state)
  window.history.replaceState({}, '', shareUrl)
}
