import { StateEffect, StateField, Extension } from '@codemirror/state'
import { EditorView, Decoration, DecorationSet } from '@codemirror/view'
import { reduceRangeSet, isEffectOfType, mapEffectValue } from '@codemirror-toolkit/utils'
import type { RangeSetUpdateFilter } from './rangeSet'
import { hasNonEmptySelectionAtLine } from './text'
import { maybeNullable } from '@/common/utils'

export const HighlightLineEffect = StateEffect.define<{
  addByPos?: number
  filter?: RangeSetUpdateFilter<Decoration>
}>({
  map({ addByPos, filter }, change) {
    return {
      addByPos: maybeNullable(addByPos)
        .map(pos => change.mapPos(pos))
        .extract(),
      filter
    }
  }
})

const lineDecoration = Decoration.line({ class: 'cm-highlightLine' })
const lineDecorationWithTransparency = Decoration.line({
  class: 'cm-highlightLine--withTransparency'
})

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
            transaction.selection.ranges
          )
        const expectedLineDecoration = hasNewOverlappedSelection
          ? lineDecorationWithTransparency
          : lineDecoration
        return decoration.eq(expectedLineDecoration)
          ? resultDecorations
          : resultDecorations.update({
              add: [expectedLineDecoration.range(decorationFrom)],
              filter: from => from !== decorationFrom
            })
      },
      decorations
    )
    return transaction.effects.filter(isEffectOfType(HighlightLineEffect)).reduce(
      (resultDecorations, effect) =>
        mapEffectValue(effect, ({ addByPos, filter }) =>
          resultDecorations.update({
            add: maybeNullable(addByPos)
              .map(pos => {
                const hasOverlappedSelection = hasNonEmptySelectionAtLine(
                  transaction.state.doc.lineAt(pos),
                  transaction.state.selection.ranges
                )
                const newLineDecoration = hasOverlappedSelection
                  ? lineDecorationWithTransparency
                  : lineDecoration
                return [newLineDecoration.range(pos)]
              })
              .extract(),
            filter
          })
        ),
      updatedDecorations
    )
  },
  provide: thisField => EditorView.decorations.from(thisField)
})

export const highlightLine = (): Extension => {
  return [
    highlightLineField,
    EditorView.baseTheme({
      '.cm-highlightLine': {
        backgroundColor: '#dcfce7 !important'
      },
      '.cm-highlightLine--withTransparency': {
        backgroundColor: '#dcfce780 !important'
      }
    })
  ]
}
