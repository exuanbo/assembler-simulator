import BaseResizablePanel, {
  DEFAULT_RESIZE_THROTTLE_MS,
  ResizablePanelProps
} from '@/common/components/ResizablePanel'
import { useSelector } from './hooks'
import { selectIsRunning } from '@/features/controller/controllerSlice'

const ResizablePanel = (props: ResizablePanelProps): JSX.Element => {
  const isRunning = useSelector(selectIsRunning)
  // const resizeThrottleMs = isRunning ? 50 : 10
  const resizeThrottleMs = DEFAULT_RESIZE_THROTTLE_MS * (isRunning ? 2 : 0.4)
  return <BaseResizablePanel resizeThrottleMs={resizeThrottleMs} {...props} />
}

export default ResizablePanel
