import React from 'react'
import Headbar from './components/Headbar'
import CodeArea from './components/CodeArea'
import IODevices from './components/IODevices'
import CPURegisters from './components/CPURegisters'
import Memory from './components/Memory'
import Tokens from './components/Tokens'

const App: React.FC = () => (
  <div className="flex flex-col w-screen h-screen divide-y">
    <Headbar className="flex-none" />
    <div className="flex h-full divide-x">
      <CodeArea className="flex-1" />
      <div className="flex-1 divide-y">
        <IODevices />
        <CPURegisters />
        <Memory />
        <Tokens />
      </div>
    </div>
  </div>
)

export default App
