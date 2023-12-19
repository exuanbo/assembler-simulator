import type { FC } from 'react'

import type { IconProps } from './types'

// https://iconmonstr.com/arrow-1-svg/
const Arrow: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="1rem" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M13 7v-6l11 11-11 11v-6h-13v-10z" />
  </svg>
)

export default Arrow
