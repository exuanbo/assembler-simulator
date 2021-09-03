import React from 'react'
import Card from '../../common/components/Card'

interface Props {
  className?: string
}

const IoDevices = ({ className }: Props): JSX.Element => (
  <Card className={className} title="I/O Devices">
    <div />
  </Card>
)

export default IoDevices
