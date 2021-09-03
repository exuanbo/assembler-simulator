import React from 'react'
import ControlButton from './ControlButton'
import { Play, Stop } from '../../common/components/icons'
import { NO_BREAK_SPACE } from '../../common/constants'

interface Props {
  getState: () => boolean
  onClick: () => void
}

const RunButton = ({ getState, onClick }: Props): JSX.Element => {
  const isRunning = getState()
  return (
    <ControlButton onClick={onClick}>
      {isRunning ? (
        <>
          <Stop className="h-4" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Play className="h-4" />
          <span>Run{NO_BREAK_SPACE}</span>
        </>
      )}
    </ControlButton>
  )
}

export default RunButton
