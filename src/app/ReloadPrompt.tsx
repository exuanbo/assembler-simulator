import { useRegisterSW } from 'virtual:pwa-register/react'

const buttonClassName = 'border rounded bg-gray-100 py-1 px-2 inline-block hover:bg-gray-200'

const ReloadPrompt = (): JSX.Element | null => {
  const {
    needRefresh: [needReload, setNeedReload],
    updateServiceWorker
  } = useRegisterSW({ immediate: true })

  const handleClickReload = async (): Promise<void> => {
    setNeedReload(false)
    await updateServiceWorker(/* reloadPage: */ true)
  }

  const handleClickClose = (): void => {
    setNeedReload(false)
  }

  return needReload ? (
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
