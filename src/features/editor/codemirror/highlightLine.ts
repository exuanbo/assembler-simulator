import { StateEffect, StateField, Extension } from '@codemirror/state'
import { EditorView, Decoration, DecorationSet } from '@codemirror/view'
import { RangeSetUpdateFilter, reduceRangeSet } from './rangeSet'
import { hasNonEmptySelectionAtLine } from './text'
import { maybeNullable } from '@/common/utils'

export const HighlightLineEffect = StateEffect.define<{
  addByPos?: number
  filter?: RangeSetUpdateFilter<Decoration>
}>({
  map({ addByPos, filter }, mapping) {
    return {
      addByPos: maybeNullable(addByPos)
        .map(pos => mapping.mapPos(pos))
        .extract(),
      filter
    }
  }
})

const lineDecoration = Decoration.line({ class: 'cm-highlightLine' })
const lineDecorationWithOpacity = Decoration.line({
  class: 'cm-highlightLine--withOpacity',
  // TODO: upgrade @codemirror/view and remove this
  attributes: {}
})

const highlightLineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(decorationSet, transaction) {
    const mappedDecorationSet = decorationSet.map(transaction.changes)
    const updatedDecorationSet = reduceRangeSet(
      mappedDecorationSet,
      (resultSet, decoration, decorationFrom) => {
        const hasNewOverlappedSelection =
          transaction.selection !== undefined &&
          hasNonEmptySelectionAtLine(
            transaction.state.doc.lineAt(decorationFrom),
            transaction.selection.ranges
          )
        const expectedLineDecoration = hasNewOverlappedSelection
          ? lineDecorationWithOpacity
          : lineDecoration
        return decoration.eq(expectedLineDecoration)
          ? resultSet
          : resultSet.update({
              add: [expectedLineDecoration.range(decorationFrom)],
              filter: from => from !== decorationFrom
            })
      },
      mappedDecorationSet
    )
    return transaction.effects.reduce(
      (resultSet, effect) =>
        effect.is(HighlightLineEffect)
          ? resultSet.update({
              add: maybeNullable(effect.value.addByPos)
                .map(pos => {
                  const hasOverlappedSelection = hasNonEmptySelectionAtLine(
                    transaction.state.doc.lineAt(pos),
                    transaction.state.selection.ranges
                  )
                  const newLineDecoration = hasOverlappedSelection
                    ? lineDecorationWithOpacity
                    : lineDecoration
                  return [newLineDecoration.range(pos)]
                })
                .extract(),
              filter: effect.value.filter
            })
          : resultSet,
      updatedDecorationSet
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
      '.cm-highlightLine--withOpacity': {
        backgroundColor: '#dcfce780 !important'
      }
    })
  ]
}
