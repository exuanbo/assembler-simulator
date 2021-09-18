import type { Extension } from '@codemirror/state'
import { EditorView, keymap, drawSelection } from '@codemirror/view'
import { indentUnit } from '@codemirror/language'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { history, historyKeymap } from '@codemirror/history'
import { lineNumbers } from '@codemirror/gutter'
import { defaultHighlightStyle } from '@codemirror/highlight'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets'
import { breakpointGutter } from './breakpointGutter'
import { highlightActiveRange } from './highlightActiveRange'
import { Asm } from './lang-asm'

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
  breakpointGutter(),
  lineNumbers(),
  closeBrackets(),
  Asm(),
  indentUnit.of('\t'),
  EditorView.lineWrapping,
  defaultHighlightStyle,
  theme,
  keymap.of([indentWithTab, ...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap])
]
