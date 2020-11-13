/* eslint react/jsx-pascal-case: [2, { ignore: ['RAM', 'VDU'] }] */
import { FunctionalComponent, h } from 'preact'
import 'antd/dist/antd.css'
import { Row, Col } from 'antd'
import CodeArea from './codeArea'
import Memory from './memory'
import RAM from './ram'
import VDU from './vdu'

const App: FunctionalComponent = () => (
  <>
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
  </>
)

export default App
