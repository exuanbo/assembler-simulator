import type { Extension } from '@codemirror/state'
import { EditorView, highlightActiveLine as __highlightActiveLine } from '@codemirror/view'

export const highlightActiveLine = (): Extension => [
  __highlightActiveLine(),
  EditorView.baseTheme({
    '&.cm-focused .cm-activeLine': {
      boxShadow: 'inset 0 0 0 2px #e5e7eb'
    },
    '.cm-activeLine': {
      backgroundColor: 'initial'
    }
  })
]
