import { StateEffect, StateField, Extension } from '@codemirror/state'
import { EditorView, Decoration, DecorationSet } from '@codemirror/view'
import { reduceRangeSet, isEffectOfType, mapEffectValue } from '@codemirror-toolkit/utils'
import type { RangeSetUpdateFilter } from './rangeSet'
import { hasNonEmptySelectionAtLine } from './text'
import { maybeNullable } from '@/common/utils'

// TODO: extract to separate file
enum HighlightLineClass {
  Default = 'cm-highlightLine',
  Transparent = 'cm-highlightLine--transparent'
}

export const HighlightLineEffect = StateEffect.define<{
  pos?: number
  filter?: RangeSetUpdateFilter<Decoration>
}>({
  map({ pos: targetPos, filter }, change) {
    return {
      pos: maybeNullable(targetPos)
        .map(pos => change.mapPos(pos))
        .extract(),
      filter
    }
  }
})

const lineDecoration = Decoration.line({ class: HighlightLineClass.Default })
const lineDecorationTransparent = Decoration.line({ class: HighlightLineClass.Transparent })

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
          ? lineDecorationTransparent
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
        mapEffectValue(effect, ({ pos: targetPos, filter }) =>
          resultDecorations.update({
            add: maybeNullable(targetPos)
              .map(pos => {
                const hasOverlappedSelection = hasNonEmptySelectionAtLine(
                  transaction.state.doc.lineAt(pos),
                  transaction.state.selection.ranges
                )
                const newLineDecoration = hasOverlappedSelection
                  ? lineDecorationTransparent
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
      [`.${HighlightLineClass.Default}`]: {
        backgroundColor: '#dcfce7 !important'
      },
      [`.${HighlightLineClass.Transparent}`]: {
        backgroundColor: '#dcfce780 !important'
      }
    })
  ]
}
