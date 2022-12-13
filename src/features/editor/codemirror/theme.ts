import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

export const theme = (): Extension => {
  return EditorView.theme({
    '&': {
      height: '100%'
    },
    '&.cm-focused': {
      outline: '0'
    },
    '.cm-scroller': {
      fontFamily: "'Jetbrains Mono', monospace"
    },
    '.cm-gutters': {
      borderRight: '1px solid #e5e7eb',
      backgroundColor: '#f3f4f6', // gray-100
      color: '#9ca3af' // gray-400
    },
    '.cm-breakpoints': {
      fontSize: '0.875em'
    },
    '.cm-lineNumbers': {
      paddingRight: '6px'
    },
    '.cm-cursor': {
      borderLeft: '2px solid black'
    }
  })
}
