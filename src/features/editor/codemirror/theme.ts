import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

export const theme = (): Extension =>
  EditorView.theme({
    '&': {
      height: '100%'
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
