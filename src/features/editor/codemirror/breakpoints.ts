import { EditorState, StateField, StateEffect, Extension } from '@codemirror/state'
import { EditorView, ViewUpdate } from '@codemirror/view'
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

export const getBreakpoints = (state: EditorState): RangeSet<BreakpointMarker> =>
  state.field(breakpointField)

export const toggleBreakpoint = (view: EditorView, pos: number): void => {
  const breakpoints = getBreakpoints(view.state)
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
    markers: view => getBreakpoints(view.state),
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

export const breakpointsChanged = ({ state, startState }: ViewUpdate): boolean => {
  const [newBreakpoints, oldBreakpoints] = [state, startState].map(getBreakpoints)
  if (newBreakpoints.size !== oldBreakpoints.size) {
    return true
  }
  if (newBreakpoints.size === 0) {
    return false
  }
  const newCursor = newBreakpoints.iter()
  const oldCursor = oldBreakpoints.iter()
  for (let i = 0; i < newBreakpoints.size; i++, newCursor.next(), oldCursor.next()) {
    if (newCursor.from !== oldCursor.from || newCursor.to !== oldCursor.to) {
      return true
    }
  }
  return false
}
