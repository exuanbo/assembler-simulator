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

const EditorMessage = (): JSX.Element | null => {
  const message = useMessage()

  return message === null ? null : (
    <div className={classNames('py-1 px-2 text-light-100', getClassNameFrom(message.type))}>
      {message.content}
    </div>
  )
}

export default EditorMessage
