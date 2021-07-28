import React from 'react'
import { errorState } from '../atoms'

const Status = (): JSX.Element | null => {
  const [error] = errorState.useState()

  return error !== null ? (
    <div className={`px-3 py-1 text-white ${error === null ? 'bg-blue-500' : 'bg-red-500'}`}>
      {error}
    </div>
  ) : null
}

export default Status
