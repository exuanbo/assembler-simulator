import React, { useReducer } from 'react'
import Card from '../../common/components/Card'
import { EyeClose, EyeOpen } from '../../common/components/icons'
import Vdu from './Vdu'

interface Props {
  className?: string
}

const IoDevices = ({ className }: Props): JSX.Element => {
  const [isOpen, toggleOpen] = useReducer((state: boolean) => !state, false)

  return (
    <Card
      Icon={isOpen ? EyeClose : EyeOpen}
      className={className}
      title="I/O Devices"
      onIconClick={toggleOpen}>
      {isOpen ? (
        <div>
          <Vdu />
        </div>
      ) : null}
    </Card>
  )
}

export default IoDevices
