import React from 'react'

interface Props {
  [prop: string]: unknown
}

const Play = (props: Props): JSX.Element => (
  <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M3 22v-20l18 10-18 10z" />
  </svg>
)

export default Play
