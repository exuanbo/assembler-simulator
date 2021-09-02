import React from 'react'
import ControlButton from './ControlButton'
import { Play, Forward, Redo, GithubAlt } from '../../common/components/icons'
import { useController } from './hooks'

interface Props {
  className?: string
}

const HeaderBar = ({ className }: Props): JSX.Element => {
  const { step } = useController()

  return (
    <nav
      className={`border-b flex bg-gray-100 shadow mb-0.5 items-center justify-between ${className}`}>
      <div className="divide-x flex h-full">
        <ControlButton onClick={() => undefined}>
          <Play className="h-4" />
          <span>Run</span>
        </ControlButton>
        <ControlButton onClick={step}>
          <Forward className="h-4" />
          <span>Step</span>
        </ControlButton>
        <ControlButton onClick={() => undefined}>
          <Redo className="h-4" />
          <span>Reset</span>
        </ControlButton>
      </div>
      <div className="flex space-x-2 pr-2 items-center">
        <span>Assembler Simulator</span>
        <a
          href="https://github.com/exuanbo/assembler-simulator"
          rel="noopener noreferrer"
          target="_blank">
          <GithubAlt className="h-1.2rem" />
        </a>
      </div>
    </nav>
  )
}

export default HeaderBar
