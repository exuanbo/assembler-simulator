import React from 'react'
import { errorState } from '../atoms'

const Status: React.FC = () => {
  const [error] = errorState.useState()

  return (
    <div
      className={`px-3 py-1 text-white ${
        error === null ? 'bg-blue-500' : 'bg-red-500'
      }`}>
      {error === null ? 'Looks good so far :D' : error}
    </div>
  )
}

export default Status
