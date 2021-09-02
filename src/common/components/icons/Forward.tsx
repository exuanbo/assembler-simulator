import React from 'react'

interface Props {
  [prop: string]: unknown
}

const Forward = (props: Props): JSX.Element => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M14 12l-14 9v-18l14 9zm-4-9v4l8.022 5-8.022 5v4l14-9-14-9z" />
  </svg>
)

export default Forward
