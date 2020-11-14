/* eslint react/jsx-pascal-case: [2, { ignore: ['RAM', 'VDU'] }] */
import { FunctionalComponent, h } from 'preact'
import { Layout, Row, Col } from 'antd'
import 'antd/es/layout/style'
import 'antd/es/row/style'
import 'antd/es/col/style'
import Headbar from './headbar'
import CodeArea from './codeArea'
import Memory from './memory'
import RAM from './ram'
import VDU from './vdu'

const { Header, Content } = Layout

const App: FunctionalComponent = () => (
  <Layout>
    <Header style={{ padding: 0, backgroundColor: '#fafafa' }}>
      <Headbar />
    </Header>
    <Content>
      <Row>
        <Col span={12}>
          <CodeArea />
        </Col>
        <Col span={12}>
          <Memory />
          <RAM />
          <VDU />
        </Col>
      </Row>
    </Content>
  </Layout>
)

export default App
