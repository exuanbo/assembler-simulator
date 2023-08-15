import BaseResizablePanel, {
  DEFAULT_RESIZE_THROTTLE_MS,
  ResizablePanelProps
} from '@/common/components/ResizablePanel'
import { useSelector } from './selector'
import { selectIsRunning } from '@/features/controller/controllerSlice'

const ResizablePanel = (props: ResizablePanelProps): JSX.Element => {
  const isRunning = useSelector(selectIsRunning)
  const throttleMs = DEFAULT_RESIZE_THROTTLE_MS * (isRunning ? 5 : 1)
  return <BaseResizablePanel throttle={throttleMs} {...props} />
}

export default ResizablePanel
