import * as tracker from 'ackee-tracker'
import { useEffect } from 'react'

const DETAILED = true

export const useAckee = () => {
  useEffect(() => {
    const { pathname, origin } = window.location
    const url = new URL(pathname, origin)

    const { stop } = tracker
      .create('https://ackee.exuanbo.xyz/')
      .record('bc75fd47-884f-4723-aaf6-3384103e0095', {
        ...tracker.attributes(DETAILED),
        siteLocation: url.href,
      })
    return stop
  }, [])
}
