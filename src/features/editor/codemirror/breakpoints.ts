import { StateField, StateEffect, Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { RangeSet } from '@codemirror/rangeset'
import { GutterMarker, gutter } from '@codemirror/gutter'

export const breakpointEffect = StateEffect.define<{
  pos: number
  on: boolean
}>({
  map(value, mapping) {
    return {
      pos: mapping.mapPos(value.pos),
      on: value.on
    }
  }
})

const breakpointMarker: GutterMarker = new (class extends GutterMarker {
  toDOM(): Text {
    return document.createTextNode('●')
  }
})()

const breakpointField = StateField.define<RangeSet<GutterMarker>>({
  create() {
    return RangeSet.empty
  },
  update(markerSet, transaction) {
    return transaction.effects.reduce<RangeSet<GutterMarker>>(
      (resultSet, effect) =>
        effect.is(breakpointEffect)
          ? resultSet.update(
              effect.value.on
                ? { add: [breakpointMarker.range(effect.value.pos)] }
                : { filter: from => from !== effect.value.pos }
            )
          : resultSet,
      markerSet.map(transaction.changes)
    )
  }
})

const toggleBreakpoint = (view: EditorView, pos: number): void => {
  const breakpoints = view.state.field(breakpointField)
  let hasBreakpoint = false
  breakpoints.between(pos, pos, () => {
    hasBreakpoint = true
    return false // stops the iteration
  })
  view.dispatch({
    effects: breakpointEffect.of({
      pos,
      on: !hasBreakpoint
    })
  })
}

export const breakpoints = (): Extension => [
  breakpointField,
  gutter({
    class: 'cm-breakpoints',
    markers: view => view.state.field(breakpointField),
    initialSpacer: () => breakpointMarker,
    domEventHandlers: {
      mousedown(view, line) {
        toggleBreakpoint(view, line.from)
        return true
      }
    }
  }),
  EditorView.baseTheme({
    '.cm-breakpoints .cm-gutterElement': {
      minWidth: '20px',
      padding: '0 3px 0 5px',
      color: '#f87171'
    }
  })
]
