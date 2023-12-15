import { type Extension, StateEffect, StateField } from '@codemirror/state'
import { Decoration, type DecorationSet, EditorView } from '@codemirror/view'
import { filterEffects, mapEffectValue } from '@codemirror-toolkit/utils'

import type { Maybe } from '@/common/maybe'

import { ClassName } from './classNames'
import type { RangeSetUpdateFilter } from './rangeSet'

export const WavyUnderlineEffect = StateEffect.define<{
  range: Maybe<{ from: number; to: number }>
  filter?: RangeSetUpdateFilter<Decoration>
}>({
  map({ range: maybeRange, filter }, change) {
    return {
      range: maybeRange.map(({ from, to }) => ({
        from: change.mapPos(from),
        to: change.mapPos(to),
      })),
      filter,
    }
  },
})

const markDecoration = Decoration.mark({ class: ClassName.WavyUnderline })

const wavyUnderlineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(__decorations, transaction) {
    const decorations = __decorations.map(transaction.changes)
    return filterEffects(transaction.effects, WavyUnderlineEffect).reduce(
      (resultDecorations, effect) =>
        mapEffectValue(effect, ({ range: maybeRange, filter }) =>
          resultDecorations.update({
            add: maybeRange.map(({ from, to }) => [markDecoration.range(from, to)]).extract(),
            filter,
          }),
        ),
      decorations,
    )
  },
  provide: (thisField) => EditorView.decorations.from(thisField),
})

const WAVY_UNDERLINE_IMAGE = `url('data:image/svg+xml;base64,${window.btoa(
  `<svg height="4" width="6" xmlns="http://www.w3.org/2000/svg">
  <path fill="none" stroke="red" d="m0 3 l2 -2 l1 0 l2 2 l1 0" />
</svg>`,
)}')`

export const wavyUnderline = (): Extension => {
  return [
    wavyUnderlineField,
    EditorView.baseTheme({
      [`.${ClassName.WavyUnderline}`]: {
        background: `${WAVY_UNDERLINE_IMAGE} left bottom repeat-x`,
        paddingBottom: '2px',
      },
    }),
  ]
}
