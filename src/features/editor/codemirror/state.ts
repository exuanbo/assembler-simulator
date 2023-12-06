import type { EditorState, TransactionSpec } from '@codemirror/state'

export const replaceContent = (state: EditorState, content: string): TransactionSpec => {
  const endIndex = state.doc.length
  return {
    changes: {
      from: 0,
      to: endIndex,
      insert: content,
    },
  }
}
