import React from 'react'
import HeaderBar from '../features/controller/HeaderBar'
import Editor from '../features/editor/Editor'
import IoDevices from '../features/io/IoDevices'
import CpuRegisters from '../features/cpu/CpuRegisters'
import Memory from '../features/memory/Memory'

const App = (): JSX.Element => (
  <div className="flex flex-col font-mono h-screen w-screen select-none">
    <HeaderBar className="flex-none" />
    <div className="divide-x flex h-full">
      <Editor className="flex-1" />
      <div className="divide-y flex flex-col flex-1">
        <CpuRegisters />
        <Memory />
        <IoDevices className="flex-1" />
      </div>
    </div>
  </div>
)

export default App
