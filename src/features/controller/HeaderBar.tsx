import React from 'react'
import ControlButton from './ControlButton'
import ConfigurationMenu from './ConfigurationMenu'
import { Play, Stop, Forward, Undo, Github } from '../../common/components/icons'
import { useController } from './hooks'
import { useAppSelector } from '../../app/hooks'
import { selectIsRunning } from './controllerSlice'
import { NO_BREAK_SPACE } from '../../common/constants'

interface Props {
  className?: string
}

const HeaderBar = ({ className }: Props): JSX.Element => {
  const { run, step, reset } = useController()

  const RunButton = (): JSX.Element => {
    const isRunning = useAppSelector(selectIsRunning)

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
    <nav
      className={`border-b flex bg-gray-100 h-8 w-full z-2 fixed items-center justify-between ${className}`}>
      <div className="divide-x flex h-full">
        <ConfigurationMenu />
        <RunButton />
        <ControlButton onClick={step}>
          <Forward />
          <span>Step</span>
        </ControlButton>
        <ControlButton onClick={reset}>
          <Undo />
          <span>Reset</span>
        </ControlButton>
      </div>
      <div className="flex space-x-2 pr-2 items-center">
        <span>Assembler Simulator</span>
        <a
          href="https://github.com/exuanbo/assembler-simulator"
          rel="noopener noreferrer"
          target="_blank">
          <Github className="h-1.2rem" />
        </a>
      </div>
    </nav>
  )
}

export default HeaderBar
