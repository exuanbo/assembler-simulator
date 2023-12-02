import CardHeader from '@/common/components/CardHeader'
import { ArrowDown, ArrowUp } from '@/common/components/icons'
import { useToggle } from '@/common/hooks'

import SevenSegmentDisplay from './SevenSegmentDisplay'
import SimulatedKeyboard from './SimulatedKeyboard'
import TrafficLights from './TrafficLights'
import VisualDisplayUnit from './VisualDisplayUnit'

const IoDevices = (): JSX.Element => {
  const [isOpen, toggleOpen] = useToggle(true)
  const Icon = isOpen ? ArrowUp : ArrowDown

  return (
    <div>
      <CardHeader title="I/O Devices" onClick={toggleOpen}>
        <span className="w-4">
          <Icon className="mx-auto fill-gray-400" width="0.625rem" />
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
