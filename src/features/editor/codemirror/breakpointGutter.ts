import { StateField, StateEffect, Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { RangeSet } from '@codemirror/rangeset'
import { GutterMarker, gutter } from '@codemirror/gutter'

export const breakpointEffect = StateEffect.define<{ pos: number; on: boolean }>({
  map(value, mapping) {
    return {
      pos: mapping.mapPos(value.pos),
      on: value.on
    }
  }
})

const breakpointField = StateField.define<RangeSet<GutterMarker>>({
  create() {
    return RangeSet.empty
  },
  update(set, transaction) {
    return transaction.effects.reduce<RangeSet<GutterMarker>>(
      (resultSet, effect) =>
        effect.is(breakpointEffect)
          ? resultSet.update(
              effect.value.on
                ? { add: [breakpointMarker.range(effect.value.pos)] }
                : { filter: from => from !== effect.value.pos }
            )
          : resultSet,
      set.map(transaction.changes)
    )
  }
})

const toggleBreakpoint = (view: EditorView, pos: number): void => {
  const breakpoints = view.state.field(breakpointField)
  let hasBreakpoint = false
  breakpoints.between(pos, pos, () => {
    hasBreakpoint = true
  })
  view.dispatch({
    effects: breakpointEffect.of({
      pos,
      on: !hasBreakpoint
    })
  })
}

const breakpointMarker: GutterMarker = new (class extends GutterMarker {
  toDOM(): Text {
    return document.createTextNode('●')
  }
})()

export const breakpointGutter = (): Extension => [
  breakpointField,
  gutter({
    class: 'cm-breakpoint-gutter',
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
    '.cm-breakpoint-gutter .cm-gutterElement': {
      minWidth: '1.625em',
      paddingLeft: '5px',
      color: 'red'
    }
  })
]
