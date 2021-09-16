import { StateField, StateEffect, Extension } from '@codemirror/state'
import { EditorView, Decoration, DecorationSet } from '@codemirror/view'
import type { Range } from '@codemirror/rangeset'
import { range } from '../../../common/utils'

export const highlightActiveRangeEffect = StateEffect.define<{
  from: number
  to: number
} | null>()

const lineDecoration = Decoration.line({ attributes: { class: 'cm-activeRange' } })

const activeRangeField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(_, transaction) {
    return transaction.effects.reduce<DecorationSet>((decorationSet, effect) => {
      if (effect.is(highlightActiveRangeEffect) && effect.value !== null) {
        const { from, to } = effect.value
        const lineNumbers: number[] = []
        const decorationRanges = range(from, to).reduce<Array<Range<Decoration>>>((ranges, pos) => {
          const line = transaction.state.doc.lineAt(pos)
          const lineNumber = line.number
          if (!lineNumbers.includes(lineNumber)) {
            lineNumbers.push(lineNumber)
            ranges.push(lineDecoration.range(line.from))
          }
          return ranges
        }, [])
        return decorationSet.update({ add: decorationRanges })
      }
      return decorationSet
    }, Decoration.none)
  },
  provide: field => EditorView.decorations.from(field)
})

export const highlightActiveRange = (): Extension => [
  activeRangeField,
  EditorView.baseTheme({
    '.cm-activeRange': {
      backgroundColor: '#dcfce7'
    }
  })
]
