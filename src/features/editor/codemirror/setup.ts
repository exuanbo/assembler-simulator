import type { Extension } from '@codemirror/state'
import { EditorView, keymap, drawSelection } from '@codemirror/view'
import { indentUnit } from '@codemirror/language'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { history, historyKeymap } from '@codemirror/history'
import { lineNumbers } from '@codemirror/gutter'
import { foldGutter, foldKeymap } from '@codemirror/fold'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets'
import { breakpointGutter } from './breakpointGutter'
import { highlightActiveRange } from './highlightActiveRange'
import { defaultHighlightStyle } from '@codemirror/highlight'
import { Asm } from './lang'

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
  '.cm-breakpoint-gutter .cm-gutterElement': {
    fontSize: '0.875em'
  }
})

export const setup: Extension = [
  drawSelection(),
  highlightActiveRange(),
  history(),
  breakpointGutter(),
  lineNumbers(),
  foldGutter(),
  closeBrackets(),
  Asm(),
  indentUnit.of('\t'),
  EditorView.lineWrapping,
  defaultHighlightStyle,
  theme,
  keymap.of([
    indentWithTab,
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...historyKeymap,
    ...foldKeymap
  ])
]
