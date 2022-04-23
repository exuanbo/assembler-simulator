import CardHeader from '@/common/components/CardHeader'
import SimulatedKeyboard from './SimulatedKeyboard'
import VisualDisplayUnit from './VisualDisplayUnit'
import TrafficLights from './TrafficLights'
import SevenSegmentDisplay from './SevenSegmentDisplay'
import { ArrowUp, ArrowDown } from '@/common/components/icons'
import { useToggle } from '@/common/hooks'

const IoDevices = (): JSX.Element => {
  const [isOpen, toggleOpen] = useToggle(true)
  const Icon = isOpen ? ArrowUp : ArrowDown

  return (
    <div>
      <CardHeader title="I/O Devices" onClick={toggleOpen}>
        <span className="w-4">
          <Icon className="mx-auto fill-gray-400 w-2.5" />
        </span>
      </CardHeader>
      <SimulatedKeyboard />
      {isOpen && (
        <div className="flex flex-wrap py-1 px-1 items-start">
          <VisualDisplayUnit />
          <TrafficLights />
          <SevenSegmentDisplay />
        </div>
      )}
    </div>
  )
}

export default IoDevices
