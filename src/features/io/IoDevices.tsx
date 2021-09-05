import React, { useReducer } from 'react'
import Card from '../../common/components/Card'
import { EyeClosed, EyeOpen } from '../../common/components/icons'
import Vdu from './Vdu'

interface Props {
  className?: string
}

const IoDevices = ({ className }: Props): JSX.Element => {
  const [isActive, toggleActive] = useReducer((state: boolean) => !state, true)

  return (
    <Card
      Icon={isActive ? EyeClosed : EyeOpen}
      className={className}
      title="I/O Devices"
      onIconClick={toggleActive}>
      {isActive ? (
        <div>
          <Vdu />
        </div>
      ) : null}
    </Card>
  )
}

export default IoDevices
