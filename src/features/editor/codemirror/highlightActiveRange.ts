import { Facet, StateEffect, StateField, Extension, combineConfig } from '@codemirror/state'
import { EditorView, Decoration, DecorationSet } from '@codemirror/view'
import { range } from '../../../common/utils'

interface ActiveRangeConfig {
  clearOnPointerSelect?: boolean
  clearAll?: boolean
}

const activeRangeConfigFacet = Facet.define<ActiveRangeConfig, Required<ActiveRangeConfig>>({
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

export const highlightActiveRangeEffect = StateEffect.define<{
  add?:
    | {
        from: number
        to: number
      }
    | undefined
  filter?: ((from: number, to: number) => boolean) | undefined
}>({
  map({ add, filter }, mapping) {
    return {
      add:
        add === undefined
          ? undefined
          : {
              from: mapping.mapPos(add.from),
              to: mapping.mapPos(add.to)
            },
      filter
    }
  }
})

const lineDecoration = Decoration.line({ attributes: { class: 'cm-activeRange' } })

const highlightActiveRangeField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(decorationSet, transaction) {
    const { clearOnPointerSelect, clearAll } = transaction.state.facet(activeRangeConfigFacet)
    return clearOnPointerSelect && transaction.isUserEvent('select.pointer')
      ? Decoration.none
      : transaction.effects.reduce<DecorationSet>((resultSet, effect) => {
          if (!effect.is(highlightActiveRangeEffect)) {
            return resultSet
          }
          const { add, filter = () => true } = effect.value
          const decorationRanges =
            add === undefined
              ? []
              : [
                  ...new Set(
                    range(add.from, add.to).map(pos => {
                      const line = transaction.state.doc.lineAt(pos)
                      return line.number
                    })
                  )
                ].map(lineNumber => {
                  const line = transaction.state.doc.line(lineNumber)
                  return lineDecoration.range(line.from)
                })
          return resultSet.update({
            add: decorationRanges,
            filter: clearAll ? () => false : filter
          })
        }, decorationSet.map(transaction.changes))
  },
  provide: field => EditorView.decorations.from(field)
})

export const highlightActiveRange = (config: ActiveRangeConfig = {}): Extension => [
  activeRangeConfigFacet.of(config),
  highlightActiveRangeField,
  EditorView.baseTheme({
    '.cm-activeRange': {
      backgroundColor: '#dcfce7'
    }
  })
]
