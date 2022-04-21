import { Facet, StateEffect, StateField, Extension, combineConfig } from '@codemirror/state'
import { EditorView, Decoration, DecorationSet } from '@codemirror/view'
import type { RangeSetUpdateFilter } from './rangeSet'

interface HighlightLineConfig {
  clearOnPointerSelect?: boolean
}

const HighlightLineConfigFacet = Facet.define<HighlightLineConfig, Required<HighlightLineConfig>>({
  combine(values) {
    return combineConfig(
      values,
      {
        clearOnPointerSelect: true
      },
      {
        clearOnPointerSelect(_, option) {
          return option
        }
      }
    )
  }
})

export const highlightLineEffect = StateEffect.define<{
  addByPos?: number
  filter?: RangeSetUpdateFilter<Decoration>
}>({
  map({ addByPos: add, filter }, mapping) {
    return {
      addByPos: add === undefined ? undefined : mapping.mapPos(add),
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
    const { clearOnPointerSelect } = transaction.state.facet(HighlightLineConfigFacet)
    return clearOnPointerSelect && transaction.isUserEvent('select.pointer')
      ? Decoration.none
      : transaction.effects.reduce<DecorationSet>((resultSet, effect) => {
          if (!effect.is(highlightLineEffect)) {
            return resultSet
          }
          const { addByPos: add, filter } = effect.value
          return resultSet.update({
            add: add === undefined ? undefined : [lineDecoration.range(add)],
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
      backgroundColor: '#dcfce7 !important'
    }
  })
]
