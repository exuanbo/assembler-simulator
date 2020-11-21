import { FunctionalComponent, h } from 'preact'
import { PrecoilRoot, atom } from 'precoil'
import 'bulma/bulma.sass'
import Headbar from './headbar'
import CodeArea from './codeArea'
import CPU from './cpu'
import RAM from './ram'
import VDU from './vdu'
import Log from './log'
import { Statement, LabelTuple } from '../utils/tokenize'

const defaultCode = `mov al, 5A
mov bl, D3

loop:
mov [bl], al
dec al
cmp al, 40
jz done
inc bl
jz reset
jmp loop

reset:
mov bl, c0
jmp loop

done:
end
`

export const codeState = atom<string>(defaultCode)
export const labelState = atom<LabelTuple[]>([])
export const statementState = atom<Statement[]>([])

const App: FunctionalComponent = () => (
  <PrecoilRoot>
    <section className="section">
      <Headbar />
      <div className="columns block">
        <div className="column">
          <CodeArea />
        </div>
        <div className="column">
          <CPU />
          <RAM />
          <VDU />
          <Log />
        </div>
      </div>
    </section>
  </PrecoilRoot>
)

export default App
