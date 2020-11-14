import { FunctionalComponent, h } from 'preact'
import { Space, Button } from 'antd'
import 'antd/es/space/style'
import 'antd/es/button/style'

const Headbar: FunctionalComponent = () => (
  <span style={{ padding: '0 2em' }}>
    <Space size="middle">
      <h1 style={{ marginBottom: 0, fontSize: '1.25em' }}>Samphire Online</h1>
      <Button>Assemble</Button>
      <Button>Run</Button>
      <Button>Reset</Button>
    </Space>
  </span>
)

export default Headbar
