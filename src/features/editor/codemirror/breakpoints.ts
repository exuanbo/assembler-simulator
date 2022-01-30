import { EditorState, StateField, StateEffect, Extension } from '@codemirror/state'
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

class BreakpointMarker extends GutterMarker {
  toDOM(): Text {
    return document.createTextNode('●')
  }
}

const breakpointMarker = new BreakpointMarker()

const breakpointField = StateField.define<RangeSet<BreakpointMarker>>({
  create() {
    return RangeSet.empty
  },
  update(markerSet, transaction) {
    return transaction.effects.reduce<RangeSet<BreakpointMarker>>(
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

export const getBreakpointRangeSet = (state: EditorState): RangeSet<BreakpointMarker> =>
  state.field(breakpointField)

export const toggleBreakpoint = (view: EditorView, pos: number): void => {
  const breakpoints = getBreakpointRangeSet(view.state)
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

export const breakpoints = (): Extension => [
  breakpointField,
  gutter({
    class: 'cm-breakpoints',
    markers: view => getBreakpointRangeSet(view.state),
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
      color: 'red'
    }
  })
]

export const breakpointsEqual = (
  a: RangeSet<BreakpointMarker>,
  b: RangeSet<BreakpointMarker>
): boolean => {
  if (b.size !== a.size) {
    return false
  }
  if (b.size === 0) {
    return true
  }
  const bCursor = b.iter()
  const aCursor = a.iter()
  for (let i = 0; i < b.size; i++, bCursor.next(), aCursor.next()) {
    if (bCursor.from !== aCursor.from || bCursor.to !== aCursor.to) {
      return false
    }
  }
  return true
}
