import Card from '@/common/components/Card'
import SimulatedKeyboard from './SimulatedKeyboard'
import VisualDisplayUnit from './VisualDisplayUnit'
import TrafficLights from './TrafficLights'
import SevenSegmentDisplay from './SevenSegmentDisplay'

interface Props {
  className?: string
}

const IoDevices = ({ className }: Props): JSX.Element => (
  <Card className={className} title="I/O Devices">
    <SimulatedKeyboard />
    <div className="flex flex-wrap py-1 px-1 items-start">
      <VisualDisplayUnit />
      <TrafficLights />
      <SevenSegmentDisplay />
    </div>
  </Card>
)

export default IoDevices
