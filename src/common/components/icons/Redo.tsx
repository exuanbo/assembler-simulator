import React from 'react'

interface Props {
  [prop: string]: unknown
}

/**
 * {@link https://iconmonstr.com/redo-4-svg/}
 */
const Redo = (props: Props): JSX.Element => (
  <svg className="h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M6.974 22.957c-10.957-11.421 2.326-20.865 10.384-13.309l-2.464 2.352h9.106v-8.947l-2.232 2.229c-14.794-13.203-31.51 7.051-14.794 17.675z" />
  </svg>
)

export default Redo
