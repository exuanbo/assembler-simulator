import type { FC } from 'react'

import { classNames } from '@/common/utils'

import { MessageType } from './editorSlice'
import { useMessage } from './hooks'

const getClassNameFrom = (type: MessageType): string => {
  switch (type) {
    case MessageType.Error:
      return 'bg-red-500'
    case MessageType.Warning:
      return 'bg-yellow-500'
    case MessageType.Info:
      return 'bg-blue-500'
  }
}

const EditorMessage: FC = () => {
  const message = useMessage()

  if (!message) {
    return null
  }

  return (
    <div className={classNames('py-1 px-2 text-light-100', getClassNameFrom(message.type))}>
      {message.content}
    </div>
  )
}

export default EditorMessage
