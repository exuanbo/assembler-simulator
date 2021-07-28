import React from 'react'
import Card from './Card'

interface Props {
  className?: string
}

const IODevices = ({ className }: Props): JSX.Element => (
  <Card className={className} title="Input / Output Devices">
    <div />
  </Card>
)

export default IODevices
