import React from 'react'

interface Props {
  [prop: string]: unknown
}

const EyeOpen = (props: Props): JSX.Element => (
  <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3zm9-.449s-4.252 8.449-11.985 8.449c-7.18 0-12.015-8.449-12.015-8.449s4.446-7.551 12.015-7.551c7.694 0 11.985 7.551 11.985 7.551zm-7 .449c0-2.757-2.243-5-5-5s-5 2.243-5 5 2.243 5 5 5 5-2.243 5-5z" />
  </svg>
)

export default EyeOpen
