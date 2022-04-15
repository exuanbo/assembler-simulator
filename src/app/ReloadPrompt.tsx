import { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Spinner } from '@/common/components/icons'

const buttonClassName = 'border rounded bg-gray-100 py-1 px-2 inline-block hover:bg-gray-200'

const ReloadPrompt = (): JSX.Element | null => {
  const {
    needRefresh: [needReload, setNeedReload],
    updateServiceWorker
  } = useRegisterSW({ immediate: true })

  const [isReloading, setReloading] = useState(false)

  const handleClickReload = async (): Promise<void> => {
    setReloading(true)
    await updateServiceWorker(/* reloadPage: */ true)
  }

  const handleClickClose = (): void => {
    setNeedReload(false)
  }

  return isReloading ? (
    <div className="bg-white flex bg-opacity-80 inset-0 z-10 fixed justify-center items-center">
      <Spinner className="animate-spin w-6" />
    </div>
  ) : needReload ? (
    <div className="border rounded space-y-2 bg-light-100 shadow m-4 py-2 px-4 right-0 bottom-0 fixed">
      <div>New version is available</div>
      <div className="space-x-2">
        <div className={buttonClassName} onClick={handleClickReload}>
          Reload
        </div>
        <div className={buttonClassName} onClick={handleClickClose}>
          Close
        </div>
      </div>
    </div>
  ) : null
}

export default ReloadPrompt
