import type { EditorView } from '@codemirror/view'
import { createSelector } from '@reduxjs/toolkit'

import * as Maybe from '@/common/maybe'
import { selectCurrentStatementRange } from '@/features/controller/selectors'

export const selectHighlightLinePos = createSelector(
  [selectCurrentStatementRange, (_, view: EditorView) => view.state.doc],
  (statementRange, doc) =>
    Maybe.fromNullable(statementRange).chain((range) => {
      const linePos: number[] = []
      const rangeTo = Math.min(range.to, doc.length)
      for (let pos = range.from; pos < rangeTo; pos++) {
        const line = doc.lineAt(pos)
        if (!linePos.includes(line.from)) {
          linePos.push(line.from)
        }
      }
      return Maybe.fromFalsy(linePos.length && linePos)
    }),
)
