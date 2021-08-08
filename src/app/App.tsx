import React from 'react'
import HeaderBar from '../features/controller/HeaderBar'
import Editor from '../features/editor/Editor'
import IODevices from '../features/io/IODevices'
import CPURegisters from '../features/cpu/CPURegisters'
import Memory from '../features/memory/Memory'

const App = (): JSX.Element => (
  <div className="flex flex-col w-screen h-screen divide-y">
    <HeaderBar className="flex-none" />
    <div className="flex h-full divide-x">
      <Editor className="flex-1" />
      <div className="flex flex-col flex-1 divide-y">
        <IODevices className="flex-1" />
        <CPURegisters className="flex-1" />
        <Memory className="flex-1" />
      </div>
    </div>
  </div>
)

export default App
