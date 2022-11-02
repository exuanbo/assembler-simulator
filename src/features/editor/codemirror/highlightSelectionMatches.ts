import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { highlightSelectionMatches as __highlightSelectionMatches } from '@codemirror/search'

export const highlightSelectionMatches = (): Extension => {
  return [
    EditorView.baseTheme({
      '.cm-selectionMatch': {
        backgroundColor: '#bdcfe480'
      }
    }),
    __highlightSelectionMatches()
  ]
}
