import { FunctionalComponent, h } from 'preact'
import { useState } from 'preact/hooks'
import { Card, Input } from 'antd'
import 'antd/es/card/style'
import 'antd/es/input/style'

const { TextArea } = Input

interface Props {
  onInput: (code: string) => void
}

const CodeArea: FunctionalComponent<Props> = ({ onInput }: Props) => {
  const [value, setValue] = useState('')

  return (
    <Card type="inner" title="Code">
      <TextArea
        autoSize={{ minRows: 25 }}
        style={{ width: '100%' }}
        value={value}
        onInput={event => {
          const { target } = event
          const { value } = target as HTMLTextAreaElement
          setValue(value)
          onInput(value)
        }}
      />
    </Card>
  )
}

export default CodeArea
