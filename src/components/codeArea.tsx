import { FunctionalComponent, h } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import { useAtom } from 'precoil'
import './web-font.css'
import { codeState, tokenState, addressState, errorState } from './app'
import Card from './card'
import Status from './status'
import { tokenize } from '../core/tokenize'
import { assemble } from '../core/assemble'

const CodeArea: FunctionalComponent = () => {
  const [code, setCode] = useAtom(codeState)
  const setTokens = useAtom(tokenState)[1]
  const setAdress = useAtom(addressState)[1]
  const setError = useAtom(errorState)[1]

  const textArea = useRef<HTMLTextAreaElement>()

  // TODO fix this workaround
  useEffect(() => {
    textArea.current.spellcheck = false
  }, [])

  const handleCodeChange = (): void => {
    try {
      const tokens = tokenize(code)
      setTokens(tokens)
      const address = assemble(tokens)
      setAdress(address)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    const timeoutID = setTimeout(handleCodeChange, 500)
    return () => clearTimeout(timeoutID)
  }, [code])

  return (
    <Card title="Code">
      <textarea
        ref={textArea}
        className="textarea"
        rows={20}
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
      <style jsx>{`
        textarea {
          font-family: 'Jetbrains Mono', monospace;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
      `}</style>
      <Status />
    </Card>
  )
}

export default CodeArea
