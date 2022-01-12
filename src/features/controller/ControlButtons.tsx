import type { ReactNode } from 'react'
import { Arrow, Play, Stop, Forward, Undo } from '../../common/components/icons'
import { useController } from './hooks'
import { selectIsRunning } from './controllerSlice'
import { useSelector } from '../../app/hooks'
import { NO_BREAK_SPACE } from '../../common/constants'

interface Props {
  children: ReactNode
  onClick?: React.MouseEventHandler<HTMLDivElement>
  disabled?: boolean
}

const ControlButton = ({ children, onClick, disabled = false }: Props): JSX.Element => (
  <div
    className={`flex space-x-2 py-1 px-2 items-center ${
      disabled ? 'text-gray-400 fill-gray-400' : 'hover:bg-gray-200'
    }`}
    onClick={onClick}>
    {children}
  </div>
)

const ControlButtons = (): JSX.Element => {
  const { assemble, run, step, reset } = useController()

  const AssembleButton = (): JSX.Element => (
    <ControlButton onClick={assemble}>
      <Arrow />
      <span>Assemble</span>
    </ControlButton>
  )

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
    return (
      <ControlButton disabled={isRunning} onClick={isRunning ? undefined : step}>
        <Forward />
        <span>Step</span>
      </ControlButton>
    )
  }

  const ResetButton = (): JSX.Element => (
    <ControlButton onClick={reset}>
      <Undo />
      <span>Reset</span>
    </ControlButton>
  )

  return (
    <>
      <AssembleButton />
      <RunButton />
      <StepButton />
      <ResetButton />
    </>
  )
}

export default ControlButtons
