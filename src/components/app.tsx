import { FunctionalComponent, h } from 'preact'
import { PrecoilRoot, atom } from 'precoil'
import 'bulma/bulma.sass'
import Headbar from './headbar'
import CodeArea from './codeArea'
import CPU from './cpu'
import RAM from './ram'
import VDU from './vdu'
import Tokens from './tokens'
import { Statement, LabelTuple } from '../utils/tokenize'

const DEFAULT_INPUT = `mov al, 5A
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

export const codeState = atom<string>(DEFAULT_INPUT)
export const labelState = atom<LabelTuple[]>([])
export const statementState = atom<Statement[]>([])
export const addressState = atom<number[]>([])

const App: FunctionalComponent = () => (
  <PrecoilRoot>
    <section className="section">
      <Headbar />
      <div className="columns block">
        <div className="column">
          <CodeArea />
        </div>
        <div className="column">
          <VDU />
          <CPU />
          <RAM />
          <Tokens />
        </div>
      </div>
    </section>
  </PrecoilRoot>
)

export default App
