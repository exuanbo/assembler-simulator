import type { FC, PropsWithChildren } from 'react'

import CardHeader from '@/common/components/CardHeader'
import { Close } from '@/common/components/icons'
import { classNames } from '@/common/utils'

type Props = PropsWithChildren<{
  name: string
  onClose?: () => void
  className?: string
}>

const DeviceCard: FC<Props> = ({ name, onClose, className, children }) => {
  const isClosable = onClose !== undefined
  return (
    <div className="border shadow m-1">
      <CardHeader title={name}>
        {isClosable && (
          <span
            className="rounded-full flex bg-gray-200 h-4 w-4 justify-center group hover:active:bg-gray-300"
            onClick={onClose}>
            <Close className="fill-none group-hover:fill-gray-400" width="0.5rem" />
          </span>
        )}
      </CardHeader>
      <div className={classNames('p-1', className)}>{children}</div>
    </div>
  )
}

export default DeviceCard
