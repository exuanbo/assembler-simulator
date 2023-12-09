import * as tracker from 'ackee-tracker'
import { useEffect } from 'react'

import { useSingleton } from '@/common/hooks'

const DETAILED = true

export const useAckee = () => {
  const instance = useSingleton(() => tracker.create('https://ackee.exuanbo.xyz/'))

  useEffect(() => {
    const attributes = tracker.attributes(DETAILED)

    const { pathname, origin } = window.location
    const url = new URL(pathname, origin)

    const { stop } = instance.record('bc75fd47-884f-4723-aaf6-3384103e0095', {
      ...attributes,
      siteLocation: url.href,
    })
    return stop
  }, [instance])
}
