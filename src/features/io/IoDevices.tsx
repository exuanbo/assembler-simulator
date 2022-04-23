import CardHeader from '@/common/components/CardHeader'
import SimulatedKeyboard from './SimulatedKeyboard'
import VisualDisplayUnit from './VisualDisplayUnit'
import TrafficLights from './TrafficLights'
import SevenSegmentDisplay from './SevenSegmentDisplay'

const IoDevices = (): JSX.Element => (
  <div>
    <CardHeader title="I/O Devices" />
    <SimulatedKeyboard />
    <div className="flex flex-wrap py-1 px-1 items-start">
      <VisualDisplayUnit />
      <TrafficLights />
      <SevenSegmentDisplay />
    </div>
  </div>
)

export default IoDevices
