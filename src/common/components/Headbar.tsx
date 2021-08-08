import React from 'react'
import { Play, Forward, Redo, Github } from '../icons'

interface Props {
  className?: string
}

const Headbar = ({ className }: Props): JSX.Element => (
  <nav className={`flex items-center justify-between h-10 px-3 bg-gray-50 ${className}`}>
    <div className="flex space-x-3">
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
    <div className="flex items-center space-x-2">
      <span>Assembler Simulator</span>
      <a
        href="https://github.com/exuanbo/assembler-simulator"
        rel="noopener noreferrer"
        target="_blank">
        <Github style={{ height: '1.2rem' }} />
      </a>
    </div>
  </nav>
)

export default Headbar
