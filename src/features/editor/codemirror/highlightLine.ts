import { Facet, StateEffect, StateField, Extension, combineConfig } from '@codemirror/state'
import { EditorView, Decoration, DecorationSet } from '@codemirror/view'
import type { RangeSetUpdateFilter } from './rangeSet'

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
  addByPos?: number | number[]
  filter?: RangeSetUpdateFilter<Decoration>
}>({
  map({ addByPos: add, filter }, mapping) {
    return {
      addByPos:
        add === undefined
          ? undefined
          : (typeof add === 'number' ? [add] : add).map(pos => mapping.mapPos(pos)),
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
          const { addByPos: add, filter = () => !clearAll } = effect.value
          return resultSet.update({
            add:
              add === undefined
                ? undefined
                : (typeof add === 'number' ? [add] : add).map(pos => lineDecoration.range(pos)),
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
