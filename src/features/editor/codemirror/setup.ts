import type { Extension } from '@codemirror/state'
import { EditorView, keymap, drawSelection } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { history, historyKeymap } from '@codemirror/history'
import { lineNumbers } from '@codemirror/gutter'
import { defaultHighlightStyle } from '@codemirror/highlight'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets'
import { highlightActiveRange } from './highlightActiveRange'
import { breakpoints } from './breakpoints'
import { asm } from './lang-asm'
import { indentWithTab } from './indentWithTab'

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
  drawSelection(),
  highlightActiveRange(),
  history(),
  breakpoints(),
  lineNumbers(),
  closeBrackets(),
  asm(),
  theme,
  EditorView.lineWrapping,
  defaultHighlightStyle,
  keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab])
]
