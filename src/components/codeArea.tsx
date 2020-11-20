import { FunctionalComponent, h } from 'preact'
import { useEffect } from 'preact/hooks'
import { usePrecoilState } from 'precoil'
import { Card, Input } from 'antd'
import { codeState, labelState, statementState } from './app'
import { tokenize } from '../utils/tokenize'

const { TextArea } = Input

const CodeArea: FunctionalComponent = () => {
  const [code, setCode] = usePrecoilState(codeState)
  const setLabels = usePrecoilState(labelState)[1]
  const setStatements = usePrecoilState(statementState)[1]

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      const tokens = tokenize(code)
      const { labels, statements } = tokens
      setLabels(labels)
      setStatements(statements)
    }, 500)

    return () => clearTimeout(timeoutID)
  }, [code])

  return (
    <Card title="Code">
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
