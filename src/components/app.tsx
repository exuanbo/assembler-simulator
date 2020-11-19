import { FunctionalComponent, h } from 'preact'
import { PrecoilRoot, atom } from 'precoil'
import 'antd/dist/antd.css'
import { Layout, Row, Col } from 'antd'
import Headbar from './headbar'
import CodeArea from './codeArea'
import Lables from './labels'
import Memory from './memory'
import RAM from './ram'
import VDU from './vdu'
import { Labels } from '../utils/tokenize'

const { Header, Content } = Layout

export const codeState = atom<string>('')
export const labelsState = atom<Labels>({})

const App: FunctionalComponent = () => (
  <PrecoilRoot>
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
            <Lables />
          </Col>
        </Row>
      </Content>
    </Layout>
  </PrecoilRoot>
)

export default App
