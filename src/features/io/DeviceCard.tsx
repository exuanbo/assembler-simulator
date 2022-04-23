import type { ReactNode } from 'react'
import CardHeader from '@/common/components/CardHeader'
import { decToHex } from '@/common/utils'

interface Props {
  name: string
  port?: number
  className?: string
  children?: ReactNode
}

const DeviceCard = ({ name, port, className = '', children }: Props): JSX.Element => (
  <div className="border shadow m-1">
    <CardHeader title={`${name}${port === undefined ? '' : ` (Port ${decToHex(port)})`}`} />
    <div className={`p-1 ${className}`}>{children}</div>
  </div>
)

export default DeviceCard
