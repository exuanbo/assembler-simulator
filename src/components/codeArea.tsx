import { FunctionalComponent, h } from 'preact'
import { useEffect } from 'preact/hooks'
import { usePrecoilState } from 'precoil'
import { codeState, labelState, statementState } from './app'
import Card from './card'
import { tokenize } from '../utils/tokenize'

const CodeArea: FunctionalComponent = () => {
  const [code, setCode] = usePrecoilState(codeState)
  const setLabels = usePrecoilState(labelState)[1]
  const setStatements = usePrecoilState(statementState)[1]

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      const tokens = tokenize(code)
      const { statements, labelTuples } = tokens
      setLabels(labelTuples)
      setStatements(statements)
    }, 500)

    return () => clearTimeout(timeoutID)
  }, [code])

  return (
    <Card title="Code">
      <textarea
        className="textarea"
        rows={20}
        /* eslint react/no-unknown-property: [2, { ignore: ['spellcheck'] }] */
        spellcheck={false}
        value={code}
        onChange={event => {
          const { value } = event.target as HTMLTextAreaElement
          setCode(value)
        }}
      />
    </Card>
  )
}

export default CodeArea
