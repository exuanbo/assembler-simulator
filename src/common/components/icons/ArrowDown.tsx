import type { FC } from 'react'

import type { IconProps } from './types'

// https://iconmonstr.com/arrow-65-svg/
const ArrowDown: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="1rem" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z" />
  </svg>
)

export default ArrowDown
