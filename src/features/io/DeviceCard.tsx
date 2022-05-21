import type { ReactNode } from 'react'
import CardHeader from '@/common/components/CardHeader'
import { Close } from '@/common/components/icons'
import { classNames } from '@/common/utils'

interface Props {
  name: string
  onClickClose: () => void
  children: ReactNode
  className?: string
}

const DeviceCard = ({ name, onClickClose, children, className }: Props): JSX.Element => (
  <div className="border shadow m-1">
    <CardHeader title={name}>
      <span
        className="rounded-full flex bg-gray-200 h-4 w-4 justify-center group hover:active:bg-gray-300"
        onClick={onClickClose}>
        <Close className="fill-none group-hover:fill-gray-400" width="0.5rem" />
      </span>
    </CardHeader>
    <div className={classNames('p-1', className)}>{children}</div>
  </div>
)

export default DeviceCard
