import { FunctionalComponent, h } from 'preact'
import { PrecoilRoot, atom } from 'precoil'
import 'bulma/bulma.sass'
import Headbar from './headbar'
import CodeArea from './codeArea'
import CPU from './cpu'
import RAM from './ram'
import VDU from './vdu'
import Tokens from './tokens'
import { TokenizeResult } from '../utils/tokenize'

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
export const tokenState = atom<TokenizeResult>({
  statements: [],
  labelTuples: []
})
export const addressState = atom<Uint8Array>(new Uint8Array(0))
export const errorState = atom<string | null>(null)

const App: FunctionalComponent = () => (
  <PrecoilRoot>
    <section className="section pt-4">
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
