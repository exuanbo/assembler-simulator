import React from 'react'
import HeaderBar from '../features/controller/HeaderBar'
import Editor from '../features/editor/Editor'
import IODevices from '../features/io/IODevices'
import CpuRegisters from '../features/cpu/CpuRegisters'
import Memory from '../features/memory/Memory'

const App = (): JSX.Element => (
  <div className="flex flex-col font-mono h-screen w-screen">
    <HeaderBar className="flex-none" />
    <div className="divide-x flex h-full">
      <Editor className="flex-1" />
      <div className="divide-y flex flex-col flex-1">
        <CpuRegisters />
        <Memory />
        <IODevices className="flex-1" />
      </div>
    </div>
  </div>
)

export default App
