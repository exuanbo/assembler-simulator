import { FunctionalComponent, h } from 'preact'
import { useEffect } from 'preact/hooks'
import { usePrecoilState } from 'precoil'
import { Card, Input } from 'antd'
import { codeState, labelsState } from './app'
import { tokenize, Labels } from '../utils/tokenize'

const { TextArea } = Input

const getLabels = (code: string): Labels => tokenize(code).labels

const CodeArea: FunctionalComponent = () => {
  const [code, setCode] = usePrecoilState(codeState)
  const setLabels = usePrecoilState(labelsState)[1]

  useEffect(() => {
    const timeoutID = setTimeout(() => setLabels(getLabels(code)), 500)
    return () => clearTimeout(timeoutID)
  }, [code])

  return (
    <Card type="inner" title="Code">
      <TextArea
        autoSize={{ minRows: 25 }}
        style={{ width: '100%' }}
        value={code}
        onChange={event => {
          const { value } = event.target as HTMLTextAreaElement
          setCode(value)
        }}
        spellCheck="false"
      />
    </Card>
  )
}

export default CodeArea
