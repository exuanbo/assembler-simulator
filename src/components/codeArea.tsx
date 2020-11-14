import { FunctionalComponent, h } from 'preact'
import { Card, Input } from 'antd'
import 'antd/es/card/style'
import 'antd/es/input/style'

const { TextArea } = Input

const CodeArea: FunctionalComponent = () => (
  <Card type="inner" title="Code">
    <TextArea autoSize={{ minRows: 25 }} style={{ width: '100%' }} />
  </Card>
)

export default CodeArea
