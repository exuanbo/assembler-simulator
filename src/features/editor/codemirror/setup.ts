import type { Extension } from '@codemirror/state'
import { keymap, drawSelection } from '@codemirror/view'
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { theme } from './theme'
import { wavyUnderline } from './wavyUnderline'
import { highlightLine } from './highlightLine'
import { asm } from './lang-asm'
import { breakpoints } from './breakpoints'
import { lineNumbers } from './lineNumbers'
import { indentWithTab } from './indentWithTab'

export const setup: Extension = [
  theme(),
  drawSelection(),
  wavyUnderline(),
  highlightLine(),
  asm(),
  history(),
  breakpoints(),
  lineNumbers(),
  closeBrackets(),
  keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab])
]
