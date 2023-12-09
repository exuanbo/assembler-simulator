import BaseResizablePanel, {
  DEFAULT_RESIZE_THROTTLE_MS,
  type ResizablePanelProps,
} from '@/common/components/ResizablePanel'
import { selectIsRunning } from '@/features/controller/controllerSlice'

import { useSelector } from './store'

const ResizablePanel = (props: ResizablePanelProps): JSX.Element => {
  const isRunning = useSelector(selectIsRunning)
  const throttleMs = DEFAULT_RESIZE_THROTTLE_MS * (isRunning ? 5 : 1)
  return <BaseResizablePanel throttle={throttleMs} {...props} />
}

export default ResizablePanel
