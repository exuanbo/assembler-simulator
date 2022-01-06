import { Facet, StateEffect, StateField, Extension, combineConfig } from '@codemirror/state'
import { EditorView, Decoration, DecorationSet } from '@codemirror/view'

interface HighlightLineConfig {
  clearOnPointerSelect?: boolean
  clearAll?: boolean
}

const HighlightLineConfigFacet = Facet.define<HighlightLineConfig, Required<HighlightLineConfig>>({
  combine(values) {
    return combineConfig(
      values,
      {
        clearOnPointerSelect: true,
        clearAll: true
      },
      {
        clearOnPointerSelect(_, option) {
          return option
        },
        clearAll(_, option) {
          return option
        }
      }
    )
  }
})

export const highlightLineEffect = StateEffect.define<{
  addPos?: number | number[]
  filter?: (from: number, to: number) => boolean
}>({
  map({ addPos, filter }, mapping) {
    return {
      addPos:
        addPos === undefined
          ? undefined
          : typeof addPos === 'number'
          ? mapping.mapPos(addPos)
          : addPos.map(pos => mapping.mapPos(pos)),
      filter
    }
  }
})

const lineDecoration = Decoration.line({ attributes: { class: 'cm-highlightLine' } })

const highlightLineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(decorationSet, transaction) {
    const { clearOnPointerSelect, clearAll } = transaction.state.facet(HighlightLineConfigFacet)
    return clearOnPointerSelect && transaction.isUserEvent('select.pointer')
      ? Decoration.none
      : transaction.effects.reduce<DecorationSet>((resultSet, effect) => {
          if (!effect.is(highlightLineEffect)) {
            return resultSet
          }
          const { addPos, filter = () => !clearAll } = effect.value
          return resultSet.update({
            add:
              addPos === undefined
                ? undefined
                : (typeof addPos === 'number' ? [addPos] : addPos).map(pos =>
                    lineDecoration.range(pos)
                  ),
            filter
          })
        }, decorationSet.map(transaction.changes))
  },
  provide: field => EditorView.decorations.from(field)
})

export const highlightLine = (config: HighlightLineConfig = {}): Extension => [
  HighlightLineConfigFacet.of(config),
  highlightLineField,
  EditorView.baseTheme({
    '.cm-highlightLine': {
      backgroundColor: '#dcfce7'
    }
  })
]
