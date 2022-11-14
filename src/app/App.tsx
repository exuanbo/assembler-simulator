import { useEffect } from 'react'
import ReloadPrompt from './ReloadPrompt'
import ToolBar from '@/features/controller/Toolbar'
import ResizablePanel, { DEFAULT_RESIZE_THROTTLE_MS } from '@/common/components/ResizablePanel'
import ErrorBoundary from '@/features/exception/ErrorBoundary'
import Editor from '@/features/editor/Editor'
import CpuRegisters from '@/features/cpu/CpuRegisters'
import Memory from '@/features/memory/Memory'
import IoDevices from '@/features/io/IoDevices'
import ExceptionModal from '@/features/exception/ExceptionModal'
import { useStore, useSelector } from './hooks'
import { watch } from './watcher'
import { selectStateToPersist } from './selectors'
import { saveState as saveStateToUrl } from './url'
import { saveState as saveStateToLocalStorage } from './localStorage'
import { selectIsRunning } from '@/features/controller/controllerSlice'

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

  const isRunning = useSelector(selectIsRunning)
  const resizeThrottleMs = DEFAULT_RESIZE_THROTTLE_MS * (isRunning ? 2 : 0.4)

  return (
    <>
      <div className="flex flex-col">
        <ToolBar />
        <ResizablePanel
          className="h-[calc(100vh-2rem)] w-full top-8 fixed"
          resizeThrottleMs={resizeThrottleMs}>
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
