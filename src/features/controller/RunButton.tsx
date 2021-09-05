import React from 'react'
import ControlButton from './ControlButton'
import { Play, Stop } from '../../common/components/icons'
import { NO_BREAK_SPACE } from '../../common/constants'

interface Props {
  useState: () => boolean
  onClick: React.MouseEventHandler<HTMLButtonElement>
}

const RunButton = ({ useState, onClick }: Props): JSX.Element => {
  const isRunning = useState()

  return (
    <ControlButton onClick={onClick}>
      {isRunning ? (
        <>
          <Stop />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Play />
          <span>Run{NO_BREAK_SPACE}</span>
        </>
      )}
    </ControlButton>
  )
}

export default RunButton
