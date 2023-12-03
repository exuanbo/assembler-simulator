import { ReactNode, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

import { Spinner } from '@/common/components/icons'

interface ButtonProps {
  onClick: React.MouseEventHandler<HTMLDivElement>
  children: ReactNode
}

const PromptButton = ({ onClick, children }: ButtonProps): JSX.Element => (
  <div
    className="border rounded bg-gray-100 py-1 px-2 inline-block hover:bg-gray-200"
    onClick={onClick}>
    {children}
  </div>
)

const ReloadPrompt = (): JSX.Element | null => {
  const {
    needRefresh: [needReload, setNeedReload],
    updateServiceWorker,
  } = useRegisterSW()

  const [isReloading, setReloading] = useState(false)

  const handleClickReload = (): void => {
    setReloading(true)
    void updateServiceWorker(/* reloadPage: */ true)
  }

  const handleClickClose = (): void => {
    setNeedReload(false)
  }

  return isReloading ? (
    <div className="bg-white flex bg-opacity-80 inset-0 z-10 fixed justify-center items-center">
      <Spinner className="animate-spin" width="1.5rem" />
    </div>
  ) : needReload ? (
    <div className="border rounded space-y-2 bg-light-100 shadow py-2 px-4 right-4 bottom-4 fixed">
      <div>New version is available</div>
      <div className="space-x-2">
        <PromptButton onClick={handleClickReload}>Reload</PromptButton>
        <PromptButton onClick={handleClickClose}>Close</PromptButton>
      </div>
    </div>
  ) : null
}

export default ReloadPrompt
