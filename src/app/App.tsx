import type { FC } from 'react'

import ToolBar from '@/features/controller/Toolbar'
import CpuRegisters from '@/features/cpu/CpuRegisters'
import Editor from '@/features/editor/Editor'
import ErrorBoundary from '@/features/exception/ErrorBoundary'
import ExceptionModal from '@/features/exception/ExceptionModal'
import { useGlobalExceptionHandler } from '@/features/exception/hooks'
import IoDevices from '@/features/io/IoDevices'
import Memory from '@/features/memory/Memory'

import { useAckee } from './hooks'
import ReloadPrompt from './ReloadPrompt'
import ResizablePanel from './ResizablePanel'

const App: FC = () => {
  useGlobalExceptionHandler()
  useAckee()

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
