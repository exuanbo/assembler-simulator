import React from 'react'
import HeaderBar from '../features/controller/HeaderBar'
import Editor from '../features/editor/Editor'
import IoDevices from '../features/io/IoDevices'
import CpuRegisters from '../features/cpu/CpuRegisters'
import Memory from '../features/memory/Memory'

const App = (): JSX.Element => (
  <div className="flex flex-col font-mono select-none">
    <HeaderBar className="flex-none" />
    <div className="divide-x flex h-full mt-8 min-h-[calc(100vh-2rem)]">
      <Editor className="flex-1" />
      <div className="divide-y flex flex-col flex-1">
        <CpuRegisters />
        <Memory />
        <IoDevices />
      </div>
    </div>
  </div>
)

export default App
