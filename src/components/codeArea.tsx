import { FunctionalComponent, h } from 'preact'
import { useState } from 'preact/hooks'
import { Card, Input } from 'antd'

const { TextArea } = Input

interface Props {
  onChange: (code: string) => void
}

const CodeArea: FunctionalComponent<Props> = ({ onChange }: Props) => {
  const [value, setValue] = useState('')

  return (
    <Card type="inner" title="Code">
      <TextArea
        autoSize={{ minRows: 25 }}
        style={{ width: '100%' }}
        value={value}
        onChange={event => {
          const { value } = event.target as HTMLTextAreaElement
          setValue(value)
          onChange(value)
        }}
        spellCheck="false"
      />
    </Card>
  )
}

export default CodeArea
