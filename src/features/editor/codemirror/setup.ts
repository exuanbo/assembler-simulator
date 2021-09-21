import type { Extension } from '@codemirror/state'
import { EditorView, keymap, drawSelection } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { history, historyKeymap } from '@codemirror/history'
import { lineNumbers } from '@codemirror/gutter'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets'
import { defaultHighlightStyle } from '@codemirror/highlight'
import { wavyUnderline } from './wavyUnderline'
import { highlightActiveRange } from './highlightActiveRange'
import { asm } from './lang-asm'
import { breakpoints } from './breakpoints'
import { indentWithTab } from './indentWithTab'

// TODO: extract to seprate file
const theme = EditorView.theme({
  '&': {
    height: '100%',
    width: '50vw'
  },
  '&.cm-focused': {
    outline: '0'
  },
  '.cm-scroller': {
    fontFamily: "'Jetbrains Mono', monospace"
  },
  '.cm-breakpoints': {
    fontSize: '0.875em'
  },
  '.cm-lineNumbers': {
    paddingRight: '6px'
  }
})

export const setup: Extension = [
  theme,
  EditorView.lineWrapping,
  drawSelection(),
  wavyUnderline(),
  highlightActiveRange(),
  asm(),
  history(),
  breakpoints(),
  lineNumbers(),
  closeBrackets(),
  defaultHighlightStyle,
  keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab])
]
