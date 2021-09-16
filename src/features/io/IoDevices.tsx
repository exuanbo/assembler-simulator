import React from 'react'
import Card from '../../common/components/Card'
import { EyeClosed, EyeOpen } from '../../common/components/icons'
import SimulatedKeyboard from './SimulatedKeyboard'
import VisualDisplayUnit from './VisualDisplayUnit'
import { useToggle } from '../../common/hooks'

interface Props {
  className?: string
}

const IoDevices = ({ className }: Props): JSX.Element => {
  const [isActive, toggleActive] = useToggle(true)

  return (
    <Card
      Icon={isActive ? EyeClosed : EyeOpen}
      className={className}
      title="I/O Devices"
      onIconClick={toggleActive}>
      <SimulatedKeyboard />
      {isActive ? (
        <div>
          <VisualDisplayUnit />
        </div>
      ) : null}
    </Card>
  )
}

export default IoDevices
