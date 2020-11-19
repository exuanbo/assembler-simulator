import { FunctionalComponent, h } from 'preact'
import { Space, Button } from 'antd'

const Headbar: FunctionalComponent = () => (
  <span style={{ padding: '0 2em' }}>
    <Space size="middle">
      <h1 style={{ marginBottom: 0, fontSize: '1.25em' }}>Samphire Online</h1>
      <Button>Run</Button>
      <Button>Stop</Button>
      <Button>Reset</Button>
    </Space>
  </span>
)

export default Headbar
