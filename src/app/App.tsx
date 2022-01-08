import { useEffect } from 'react'
import ToolBar from '../features/controller/Toolbar'
import Editor from '../features/editor/Editor'
import CpuRegisters from '../features/cpu/CpuRegisters'
import Memory from '../features/memory/Memory'
import IoDevices from '../features/io/IoDevices'
import { watch } from './store'
import { selectStateToPersist } from './selectors'
import { saveState } from './localStorage'

const App = (): JSX.Element => {
  useEffect(() => {
    return watch(selectStateToPersist, stateToPersist => {
      saveState(stateToPersist)
    })
  }, [])

  return (
    <div className="flex flex-col font-mono">
      <ToolBar className="flex-none" />
      <div className="divide-x flex h-[calc(100vh-2rem)] mt-8">
        <Editor className="flex-1" />
        <div className="divide-y flex flex-col flex-1 overflow-y-auto">
          <CpuRegisters />
          <Memory />
          <IoDevices />
        </div>
      </div>
    </div>
  )
}

export default App
