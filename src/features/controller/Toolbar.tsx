import React from 'react'
import FileMenu from './FileMenu'
import ViewMenu from './ViewMenu'
import ConfigurationMenu from './ConfigurationMenu'
import ControlButtons from './ControlButtons'
import { Github } from '../../common/components/icons'

interface Props {
  className: string
}

const ToolBar = ({ className }: Props): JSX.Element => (
  <div
    className={`border-b flex bg-gray-100 h-8 w-full z-2 fixed items-center justify-between ${className}`}>
    <div className="divide-x flex">
      <FileMenu />
      <ViewMenu />
      <ConfigurationMenu />
      <ControlButtons />
    </div>
    <div className="flex space-x-2 px-2 items-center">
      <h1 className="min-w-max">Assembler Simulator</h1>
      <a
        href="https://github.com/exuanbo/assembler-simulator"
        rel="noopener noreferrer"
        target="_blank">
        <Github className="h-1.2rem" />
      </a>
    </div>
  </div>
)

export default ToolBar
