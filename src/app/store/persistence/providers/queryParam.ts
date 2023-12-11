import * as Base64 from 'js-base64'
import * as Pako from 'pako'

import type { PersistenceProviderCreator } from '../types'

const QUERY_PARAMETER_NAME = 'shareable'

const getShareUrl = (state: unknown) => {
  const url = new URL(window.location.href)
  const compressedData = Pako.deflate(JSON.stringify(state))
  const encodedState = Base64.fromUint8Array(compressedData, /* urlsafe: */ true)
  url.searchParams.set(QUERY_PARAMETER_NAME, encodedState)
  return url
}

export const createQueryParamProvider: PersistenceProviderCreator = (validate, fallback) => {
  return {
    read: () => {
      const url = new URL(window.location.href)
      const encodedState = url.searchParams.get(QUERY_PARAMETER_NAME)
      if (encodedState !== null) {
        try {
          const compressedData = Base64.toUint8Array(encodedState)
          const decodedState = Pako.inflate(compressedData, { to: 'string' })
          const state: unknown = JSON.parse(decodedState)
          if (validate(state)) {
            return state
          }
        } catch {
          // ignore error
        }
      }
      return fallback
    },

    write: (state) => {
      const shareUrl = getShareUrl(state)
      window.history.replaceState({}, '', shareUrl)
    },
  }
}
