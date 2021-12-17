import React, { ReactNode } from 'react'
import { Arrow, Play, Stop, Forward, Undo } from '../../common/components/icons'
import { useSelector } from '../../app/hooks'
import { selectIsRunning } from './controllerSlice'
import { useController } from './hooks'
import { NO_BREAK_SPACE } from '../../common/constants'

interface Props {
  children: ReactNode
  onClick: React.MouseEventHandler<HTMLDivElement>
}

const ControlButton = ({ children, onClick }: Props): JSX.Element => (
  <div className="flex space-x-2 py-1 px-2 items-center hover:bg-gray-200" onClick={onClick}>
    {children}
  </div>
)

const ControlButtons = (): JSX.Element => {
  const { assemble, run, step, reset } = useController()

  const RunButton = (): JSX.Element => {
    const isRunning = useSelector(selectIsRunning)

    return (
      <ControlButton onClick={run}>
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

  return (
    <>
      <ControlButton onClick={assemble}>
        <Arrow />
        <span>Assemble</span>
      </ControlButton>
      <RunButton />
      <ControlButton onClick={step}>
        <Forward />
        <span>Step</span>
      </ControlButton>
      <ControlButton onClick={reset}>
        <Undo />
        <span>Reset</span>
      </ControlButton>
    </>
  )
}

export default ControlButtons
