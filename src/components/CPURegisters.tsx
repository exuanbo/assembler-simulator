import React from 'react'
import Card from './Card'

interface Props {
  className?: string
}

const CPURegisters = ({ className }: Props): JSX.Element => (
  <Card className={className} title="CPU Registers">
    <div />
  </Card>
)

export default CPURegisters
