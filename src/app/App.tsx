import { useEffect } from 'react'
import ToolBar from '@/features/controller/Toolbar'
import ResizablePanel from '@/common/components/ResizablePanel'
import Editor from '@/features/editor/Editor'
import CpuRegisters from '@/features/cpu/CpuRegisters'
import Memory from '@/features/memory/Memory'
import IoDevices from '@/features/io/IoDevices'
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
    <div className="flex flex-col">
      <ToolBar className="flex-none" />
      <ResizablePanel className="h-[calc(100vh-2rem)] mt-8">
        <Editor />
        <div className="divide-y flex flex-col h-full overflow-y-auto">
          <CpuRegisters />
          <Memory />
          <IoDevices />
        </div>
      </ResizablePanel>
    </div>
  )
}

export default App
