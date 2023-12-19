import type { FC } from 'react'

import type { IconProps } from './types'

// https://iconmonstr.com/media-control-50-svg/
const Stop: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="1rem" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M2 2h20v20h-20z" />
  </svg>
)

export default Stop
