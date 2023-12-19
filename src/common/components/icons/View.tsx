import type { FC } from 'react'

import type { IconProps } from './types'

// https://iconmonstr.com/view-16-svg/
const View: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="1rem" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M1.004 6.251l10.996-5.998 10.99 6.06-10.985 5.861-11.001-5.923zm11.996 7.676v9.82l10-5.362v-9.82l-10 5.362zm-2 0l-10-5.411v9.869l10 5.362v-9.82z" />
  </svg>
)

export default View
