import type { ReactNode } from 'react'
import Card from '@/common/components/Card'
import { decToHex } from '@/common/utils'

interface Props {
  name: string
  port?: number
  className?: string
  children?: ReactNode
}

const DeviceCard = ({ name, port, className = '', children }: Props): JSX.Element => (
  <Card
    className="border shadow"
    title={`${name}${port === undefined ? '' : ` (Port ${decToHex(port)})`}`}>
    <div className={`p-1 ${className}`}>{children}</div>
  </Card>
)

export default DeviceCard
