import { StateField, StateEffect, Extension } from '@codemirror/state'
import { EditorView, Decoration, DecorationSet } from '@codemirror/view'
import { range } from '../../../common/utils'

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
    if (transaction.docChanged) {
      return decorationSet // you might not need this in most cases
    }
    return transaction.effects.reduce<DecorationSet>((resultSet, effect) => {
      if (!effect.is(highlightActiveRangeEffect)) {
        return resultSet
      }
      const { add, filter } = effect.value
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
        // TODO: disable `compilerOptions.exactOptionalPropertyTypes`
        ...(filter === undefined ? undefined : { filter })
      })
    }, Decoration.none /* should be replaced with `decorationSet` in most cases */)
  },
  provide: field => EditorView.decorations.from(field)
})

export const highlightActiveRange = (): Extension => [
  highlightActiveRangeField,
  EditorView.baseTheme({
    '.cm-activeRange': {
      backgroundColor: '#dcfce7'
    }
  })
]
