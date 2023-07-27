import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { highlightSelectionMatches as __highlightSelectionMatches } from '@codemirror/search'
import { InternalClassName } from './classNames'

export const highlightSelectionMatches = (): Extension => {
  return [
    EditorView.baseTheme({
      [`.${InternalClassName.SelectionMatch}`]: {
        backgroundColor: '#bdcfe480'
      }
    }),
    __highlightSelectionMatches()
  ]
}
