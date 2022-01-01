import React, { ReactNode } from 'react'
import { Arrow, Play, Stop, Forward, Undo } from '../../common/components/icons'
import { useSelector } from '../../app/hooks'
import { selectIsRunning } from './controllerSlice'
import { useController } from './hooks'
import { NO_BREAK_SPACE } from '../../common/constants'

interface Props {
  children: ReactNode
  onClick: React.MouseEventHandler<HTMLDivElement>
  disabled?: boolean
}

const ControlButton = ({ children, onClick, disabled = false }: Props): JSX.Element => (
  <div
    className={`flex space-x-2 py-1 px-2 items-center ${
      disabled ? 'text-gray-500 fill-gray-500' : 'hover:bg-gray-200'
    }`}
    onClick={onClick}>
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

  const StepButton = (): JSX.Element => {
    const isRunning = useSelector(selectIsRunning)

    const handleClick = (): void => {
      if (isRunning) {
        return
      }
      void step()
    }

    return (
      <ControlButton disabled={isRunning} onClick={handleClick}>
        <Forward />
        <span>Step</span>
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
      <StepButton />
      <ControlButton onClick={reset}>
        <Undo />
        <span>Reset</span>
      </ControlButton>
    </>
  )
}

export default ControlButtons
