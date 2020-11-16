/* eslint react/jsx-pascal-case: [2, { ignore: ['RAM', 'VDU'] }] */
import { FunctionalComponent, h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Layout, Row, Col } from 'antd'
import 'antd/es/layout/style'
import 'antd/es/row/style'
import 'antd/es/col/style'
import Headbar from './headbar'
import CodeArea from './codeArea'
import Lables from './labels'
import Memory from './memory'
import RAM from './ram'
import VDU from './vdu'
import { tokenize, Labels } from '../utils/tokenize'

const { Header, Content } = Layout

const App: FunctionalComponent = () => {
  const [code, setCode] = useState('')
  const [lables, setLabels] = useState({})

  const getLabels = (code: string): Labels => tokenize(code).labels

  useEffect(() => {
    setLabels(getLabels(code))
  }, [code])

  return (
    <Layout>
      <Header style={{ padding: 0, backgroundColor: '#fafafa' }}>
        <Headbar />
      </Header>
      <Content>
        <Row>
          <Col span={12}>
            <CodeArea onChange={setCode} />
          </Col>
          <Col span={12}>
            <Lables value={lables} />
            <Memory />
            <RAM />
            <VDU />
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}

export default App
