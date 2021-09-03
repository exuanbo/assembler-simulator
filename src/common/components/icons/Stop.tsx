import React from 'react'

interface Props {
  [prop: string]: unknown
}

const Stop = (props: Props): JSX.Element => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M2 2h20v20h-20z" />
  </svg>
)

export default Stop
