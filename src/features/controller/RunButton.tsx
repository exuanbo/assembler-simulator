import React from 'react'
import ControlButton from './ControlButton'
import { Play, Stop } from '../../common/components/icons'

interface Props {
  getState: () => boolean
  onClick: () => void
}

const RunButton = ({ getState, onClick }: Props): JSX.Element => {
  const isRunning = getState()
  return (
    <ControlButton onClick={onClick}>
      {isRunning ? <Stop className="h-4" /> : <Play className="h-4" />}
      <span>Run</span>
    </ControlButton>
  )
}

export default RunButton
