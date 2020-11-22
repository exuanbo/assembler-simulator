import { FunctionalComponent, h } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import { usePrecoilState } from 'precoil'
import { codeState, labelState, statementState, addressState } from './app'
import Card from './card'
import { tokenize } from '../utils/tokenize'
import { assemble } from '../utils/assembler'

const CodeArea: FunctionalComponent = () => {
  const [code, setCode] = usePrecoilState(codeState)
  const setLabels = usePrecoilState(labelState)[1]
  const setStatements = usePrecoilState(statementState)[1]
  const setAdress = usePrecoilState(addressState)[1]

  const textArea = useRef<HTMLTextAreaElement>()

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      const tokens = tokenize(code)
      const { statements, labelTuples } = tokens
      setLabels(labelTuples)
      setStatements(statements)
      const address = assemble(tokens)
      setAdress(address)
    }, 500)

    return () => clearTimeout(timeoutID)
  }, [code])

  return (
    <Card title="Code">
      <textarea
        ref={textArea}
        className="textarea"
        rows={20}
        spellcheck={false}
        style={{ fontFamily: "'Fira Code', monospace" }}
        value={code}
        onChange={event => {
          const { value } = event.target as HTMLTextAreaElement
          setCode(value)
        }}
        onKeyDown={event => {
          if (event.keyCode === 9) {
            event.preventDefault()
            const { current } = textArea
            const { selectionStart, selectionEnd, value } = current
            current.value =
              value.substring(0, selectionStart) +
              '\t' +
              value.substring(selectionEnd)
            current.selectionStart = current.selectionEnd = selectionStart + 1
          }
        }}
      />
    </Card>
  )
}

export default CodeArea
