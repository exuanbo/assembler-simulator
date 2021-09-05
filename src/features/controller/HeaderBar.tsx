import React from 'react'
import RunButton from './RunButton'
import ControlButton from './ControlButton'
import ConfigurationMenu from './ConfigurationMenu'
import { Forward, Redo, Github } from '../../common/components/icons'
import { useController } from './hooks'

interface Props {
  className?: string
}

const HeaderBar = ({ className }: Props): JSX.Element => {
  const { isRunning, run, step, reset } = useController()

  return (
    <nav
      className={`border-b flex bg-gray-100 shadow fixed w-full items-center justify-between ${className}`}>
      <div className="divide-x flex h-full">
        <ConfigurationMenu />
        <RunButton useState={isRunning} onClick={run} />
        <ControlButton onClick={step}>
          <Forward />
          <span>Step</span>
        </ControlButton>
        <ControlButton onClick={reset}>
          <Redo />
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
