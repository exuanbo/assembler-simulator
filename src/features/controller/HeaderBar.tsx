import React from 'react'
import { Play, Forward, Redo, GithubAlt } from '../../common/components/icons'

interface Props {
  className?: string
}

const HeaderBar = ({ className }: Props): JSX.Element => (
  <nav className={`flex items-center justify-between h-10 bg-gray-50 ${className}`}>
    <div className="flex h-full pl-2 space-x-3">
      <button className="flex items-center space-x-1 focus:outline-none">
        <Play aria-hidden="true" className="h-4 -ml-1" />
        <span>Run</span>
      </button>
      <button className="flex items-center space-x-1 focus:outline-none">
        <Forward aria-hidden="true" className="h-4" />
        <span>Step</span>
      </button>
      <button className="flex items-center space-x-1 focus:outline-none">
        <Redo aria-hidden="true" className="h-4" />
        <span>Reset</span>
      </button>
    </div>
    <div className="flex items-center pr-2 space-x-2">
      <span>Assembler Simulator</span>
      <a
        href="https://github.com/exuanbo/assembler-simulator"
        rel="noopener noreferrer"
        target="_blank">
        <GithubAlt style={{ height: '1.2rem' }} />
      </a>
    </div>
  </nav>
)

export default HeaderBar
