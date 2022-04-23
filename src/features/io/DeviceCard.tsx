import type { ReactNode } from 'react'
import CardHeader from '@/common/components/CardHeader'
import { Close } from '@/common/components/icons'

interface Props {
  name: string
  onClickClose: () => void
  children: ReactNode
  className?: string
}

const DeviceCard = ({ name, onClickClose, children, className = '' }: Props): JSX.Element => (
  <div className="border shadow m-1">
    <CardHeader title={name}>
      <span
        className="rounded-full flex bg-gray-200 h-4 w-4 justify-center group"
        onClick={onClickClose}>
        <Close className="fill-none w-2 group-hover:fill-gray-400" />
      </span>
    </CardHeader>
    <div className={`p-1 ${className}`}>{children}</div>
  </div>
)

export default DeviceCard
