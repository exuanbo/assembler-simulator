import BaseResizablePanel, { DEFAULT_RESIZE_THROTTLE_MS } from '@/common/components/ResizablePanel'
import { selectIsRunning } from '@/features/controller/controllerSlice'

import { useSelector } from './store'

const ResizablePanel: typeof BaseResizablePanel = (props) => {
  const isRunning = useSelector(selectIsRunning)
  const throttleMs = DEFAULT_RESIZE_THROTTLE_MS * (isRunning ? 2 : 1)
  return <BaseResizablePanel throttle={throttleMs} {...props} />
}

export default ResizablePanel
