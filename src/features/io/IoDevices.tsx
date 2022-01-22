import Card from '@/common/components/Card'
import SimulatedKeyboard from './SimulatedKeyboard'
import VisualDisplayUnit from './VisualDisplayUnit'
import TrafficLights from './TrafficLights'
import SevenSegmentDisplay from './SevenSegmentDisplay'
import { EyeClosed, EyeOpen } from '@/common/components/icons'
import { useToggle } from '@/common/hooks'

interface Props {
  className?: string
}

const IoDevices = ({ className }: Props): JSX.Element => {
  const [isActive, toggleActive] = useToggle(true)

  return (
    <Card
      className={className}
      icon={
        <div className="flex items-center" onClick={toggleActive}>
          {isActive ? <EyeClosed /> : <EyeOpen />}
        </div>
      }
      title="I/O Devices">
      <SimulatedKeyboard />
      {isActive && (
        <div className="flex flex-wrap py-1 px-1 items-start">
          <VisualDisplayUnit />
          <TrafficLights />
          <SevenSegmentDisplay />
        </div>
      )}
    </Card>
  )
}

export default IoDevices
