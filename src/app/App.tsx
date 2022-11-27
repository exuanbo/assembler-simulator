import { useEffect } from 'react'
import ResizablePanel from './ResizablePanel'
import ReloadPrompt from './ReloadPrompt'
import ToolBar from '@/features/controller/Toolbar'
import ErrorBoundary from '@/features/exception/ErrorBoundary'
import Editor from '@/features/editor/Editor'
import CpuRegisters from '@/features/cpu/CpuRegisters'
import Memory from '@/features/memory/Memory'
import IoDevices from '@/features/io/IoDevices'
import ExceptionModal from '@/features/exception/ExceptionModal'
import { useStore } from './hooks'
import { watch } from './watcher'
import { selectStateToPersist } from './selectors'
import { saveState as saveStateToUrl } from './url'
import { saveState as saveStateToLocalStorage } from './localStorage'

const App = (): JSX.Element => {
  const store = useStore()

  useEffect(() => {
    const stateToPersist = selectStateToPersist(store.getState())
    saveStateToUrl(stateToPersist)
  }, [])

  useEffect(() => {
    return watch(selectStateToPersist, stateToPersist => {
      saveStateToUrl(stateToPersist)
      saveStateToLocalStorage(stateToPersist)
    })
  }, [])

  return (
    <>
      <div className="flex flex-col">
        <ToolBar />
        <ResizablePanel className="h-[calc(100vh-2rem)] w-full top-8 fixed">
          <ErrorBoundary>
            <Editor />
          </ErrorBoundary>
          <div className="flex flex-col h-full overflow-y-auto">
            <CpuRegisters />
            <Memory />
            <IoDevices />
          </div>
        </ResizablePanel>
      </div>
      <ReloadPrompt />
      <ExceptionModal />
    </>
  )
}

export default App
