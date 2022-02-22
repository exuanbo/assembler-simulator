import { MessageType, useStatusMessage } from './hooks'

const EditorStatus = (): JSX.Element | null => {
  const message = useStatusMessage()

  return message === null ? null : (
    <div
      className={`py-1 px-2 text-light-100 ${
        message.type === MessageType.Error ? 'bg-red-500' : 'bg-blue-500'
      }`}>
      {message.content}
    </div>
  )
}

export default EditorStatus
