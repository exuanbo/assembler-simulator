import {
  Facet,
  Compartment,
  TransactionSpec,
  StateEffect,
  StateField,
  Extension,
  combineConfig
} from '@codemirror/state'
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
        clearOnPointerSelect(_prevOption, option) {
          return option
        }
      }
    )
  }
})

const HighlightLineConfigCompartment = new Compartment()

export const reconfigureHighlightLine = (config: HighlightLineConfig): TransactionSpec => {
  const configExtension = HighlightLineConfigFacet.of(config)
  return {
    effects: HighlightLineConfigCompartment.reconfigure(configExtension)
  }
}

export const HighlightLineEffect = StateEffect.define<{
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

const lineDecoration = Decoration.line({ class: 'cm-highlightLine' })

const highlightLineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(decorationSet, transaction) {
    const { clearOnPointerSelect } = transaction.state.facet(HighlightLineConfigFacet)
    return clearOnPointerSelect && transaction.isUserEvent('select.pointer')
      ? Decoration.none
      : transaction.effects.reduce((resultSet, effect) => {
          if (!effect.is(HighlightLineEffect)) {
            return resultSet
          }
          const { addByPos: add, filter } = effect.value
          return resultSet.update({
            add: add === undefined ? undefined : [lineDecoration.range(add)],
            filter
          })
        }, decorationSet.map(transaction.changes))
  },
  provide: thisField => EditorView.decorations.from(thisField)
})

export const highlightLine = (config: HighlightLineConfig = {}): Extension => {
  const configExtension = HighlightLineConfigFacet.of(config)
  return [
    HighlightLineConfigCompartment.of(configExtension),
    highlightLineField,
    EditorView.baseTheme({
      '.cm-highlightLine': {
        backgroundColor: '#dcfce7 !important'
      }
    })
  ]
}
