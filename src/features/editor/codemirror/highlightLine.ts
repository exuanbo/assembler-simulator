import { StateEffect, StateField, Extension } from '@codemirror/state'
import { EditorView, Decoration, DecorationSet } from '@codemirror/view'
import { RangeSetUpdateFilter, reduceRangeSet } from './rangeSet'
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
        const lineWithDecoration = transaction.state.doc.lineAt(decorationFrom)
        const selectionRangeAtSameLine = transaction.selection?.ranges.find(
          selectionRange =>
            selectionRange.from <= lineWithDecoration.to &&
            selectionRange.to >= lineWithDecoration.from
        )
        if (selectionRangeAtSameLine === undefined) {
          // TODO: upgrade @codemirror/view and replace with `LineDecoration.eq`
          if (decoration.spec.class !== lineDecoration.spec.class) {
            return resultSet.update({
              add: [lineDecoration.range(decorationFrom)],
              filter: from => from !== decorationFrom
            })
          }
        } else {
          const newLineDecoration = selectionRangeAtSameLine.empty
            ? lineDecoration
            : lineDecorationWithOpacity
          // TODO: upgrade @codemirror/view and replace with `LineDecoration.eq`
          if (newLineDecoration.spec.class !== decoration.spec.class) {
            return resultSet.update({
              add: [newLineDecoration.range(decorationFrom)],
              filter: from => from !== decorationFrom
            })
          }
        }
        return resultSet
      },
      mappedDecorationSet
    )
    return transaction.effects.reduce(
      (resultSet, effect) =>
        effect.is(HighlightLineEffect)
          ? resultSet.update({
              add: maybeNullable(effect.value.addByPos)
                .map(pos => {
                  const lineWithPos = transaction.state.doc.lineAt(pos)
                  const hasSelectionAtSameLine = transaction.state.selection.ranges.some(
                    selectionRange =>
                      selectionRange.empty
                        ? false
                        : selectionRange.from <= lineWithPos.to &&
                          selectionRange.to >= lineWithPos.from
                  )
                  const newLineDecoration = hasSelectionAtSameLine
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
