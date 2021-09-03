import React from 'react'

interface Props {
  [prop: string]: unknown
}

/**
 * {@link https://iconmonstr.com/media-control-48-svg/}
 */
const Play = (props: Props): JSX.Element => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M3 22v-20l18 10-18 10z" />
  </svg>
)

export default Play
