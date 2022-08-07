import type { Extension } from '@codemirror/state'
import { keymap, drawSelection } from '@codemirror/view'
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { theme } from './theme'
import { asm } from './lang-asm'
import { highlightActiveLine } from './highlightActiveLine'
import { breakpoints } from './breakpoints'
import { lineNumbers } from './lineNumbers'
import { wavyUnderline } from './wavyUnderline'
import { highlightLine } from './highlightLine'
import { indentWithTab } from './indentWithTab'

export const getSetup = (): Extension => [
  drawSelection(),
  history(),
  closeBrackets(),
  theme(),
  asm(),
  highlightActiveLine(),
  breakpoints(),
  lineNumbers(),
  wavyUnderline(),
  highlightLine(),
  keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab])
]
