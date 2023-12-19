import type { FC } from 'react'

import type { IconProps } from './types'

// https://iconmonstr.com/media-control-48-svg/
const Play: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="1rem" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M3 22v-20l18 10-18 10z" />
  </svg>
)

export default Play
