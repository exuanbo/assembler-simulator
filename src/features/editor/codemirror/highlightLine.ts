import { type Extension, StateEffect, StateField } from '@codemirror/state'
import { Decoration, type DecorationSet, EditorView } from '@codemirror/view'
import { filterEffects, mapEffectValue, reduceRangeSet } from '@codemirror-toolkit/utils'

import type { Maybe } from '@/common/maybe'

import { ClassName } from './classNames'
import type { RangeSetUpdateFilter } from './rangeSet'
import { hasNonEmptySelectionAtLine } from './text'

export const HighlightLineEffect = StateEffect.define<{
  pos: Maybe<number>
  filter?: RangeSetUpdateFilter<Decoration>
}>({
  map({ pos: maybePos, filter }, change) {
    return {
      pos: maybePos.map((pos) => change.mapPos(pos)),
      filter,
    }
  },
})

const lineDecoration = Decoration.line({ class: ClassName.HighlightLineDefault })
const lineDecorationTransparent = Decoration.line({ class: ClassName.HighlightLineTransparent })

const highlightLineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(__decorations, transaction) {
    const decorations = __decorations.map(transaction.changes)
    const updatedDecorations = reduceRangeSet(
      decorations,
      (resultDecorations, decoration, decorationFrom) => {
        const hasNewOverlappedSelection =
          transaction.selection !== undefined &&
          hasNonEmptySelectionAtLine(
            transaction.state.doc.lineAt(decorationFrom),
            transaction.selection.ranges,
          )
        const expectedLineDecoration = hasNewOverlappedSelection
          ? lineDecorationTransparent
          : lineDecoration
        return decoration.eq(expectedLineDecoration)
          ? resultDecorations
          : resultDecorations.update({
              add: [expectedLineDecoration.range(decorationFrom)],
              filter: (from) => from !== decorationFrom,
            })
      },
      decorations,
    )
    return filterEffects(transaction.effects, HighlightLineEffect).reduce(
      (resultDecorations, effect) =>
        mapEffectValue(effect, ({ pos: maybePos, filter }) =>
          resultDecorations.update({
            add: maybePos
              .map((pos) => {
                const hasOverlappedSelection = hasNonEmptySelectionAtLine(
                  transaction.state.doc.lineAt(pos),
                  transaction.state.selection.ranges,
                )
                const newLineDecoration = hasOverlappedSelection
                  ? lineDecorationTransparent
                  : lineDecoration
                return [newLineDecoration.range(pos)]
              })
              .extract(),
            filter,
          }),
        ),
      updatedDecorations,
    )
  },
  provide: (thisField) => EditorView.decorations.from(thisField),
})

export const highlightLine = (): Extension => {
  return [
    highlightLineField,
    EditorView.baseTheme({
      [`.${ClassName.HighlightLineDefault}`]: {
        backgroundColor: '#dcfce7 !important',
      },
      [`.${ClassName.HighlightLineTransparent}`]: {
        backgroundColor: '#dcfce780 !important',
      },
    }),
  ]
}
