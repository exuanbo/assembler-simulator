import { StateEffect, StateField, Extension } from '@codemirror/state'
import { EditorView, Decoration, DecorationSet } from '@codemirror/view'
import type { RangeSetUpdateFilter } from './rangeSet'

export const WavyUnderlineEffect = StateEffect.define<{
  add?: { from: number; to: number }
  filter?: RangeSetUpdateFilter<Decoration>
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

const markDecoration = Decoration.mark({ class: 'cm-wavyUnderline' })

const wavyUnderlineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(decorationSet, transaction) {
    return transaction.effects.reduce((resultSet, effect) => {
      if (!effect.is(WavyUnderlineEffect)) {
        return resultSet
      }
      const { add, filter } = effect.value
      return resultSet.update({
        add: add === undefined ? undefined : [markDecoration.range(add.from, add.to)],
        filter
      })
    }, decorationSet.map(transaction.changes))
  },
  provide: thisField => EditorView.decorations.from(thisField)
})

const WAVY_UNDERLINE_IMAGE = `url('data:image/svg+xml;base64,${window.btoa(
  `<svg height="4" width="6" xmlns="http://www.w3.org/2000/svg">
  <path fill="none" stroke="red" d="m0 3 l2 -2 l1 0 l2 2 l1 0" />
</svg>`
)}')`

export const wavyUnderline = (): Extension => {
  return [
    wavyUnderlineField,
    EditorView.baseTheme({
      '.cm-wavyUnderline': {
        background: `${WAVY_UNDERLINE_IMAGE} left bottom repeat-x`,
        paddingBottom: '2px'
      }
    })
  ]
}
