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
    // TODO: upgrade @codemirror/view and remove this style
    // https://github.com/codemirror/view/commit/40620534f652f9a29ccc7a7dc1d21d9ab7992f9a?#diff-0e21fb1c9519a397050defc2148a2d1b966a0982cc4cf196e1e6b007f8d095e5
    '.cm-content': {
      minHeight: '100%'
    },
    '.cm-cursor': {
      borderLeft: '2px solid black'
    }
  })
}
