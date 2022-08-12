import { EditorState, StateEffect, StateField, RangeSet, Extension } from '@codemirror/state'
import { EditorView, GutterMarker, gutter } from '@codemirror/view'
import type { DOMEventHandler as GutterDOMEventHandler } from './gutter'

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
  public toDOM(): Text {
    return document.createTextNode('●')
  }
}

const breakpointMarker = new BreakpointMarker()

type BreakpointSet = RangeSet<BreakpointMarker>

const breakpointField = StateField.define<BreakpointSet>({
  create() {
    return RangeSet.empty
  },
  update(markerSet, transaction) {
    return transaction.effects.reduce(
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

export const getBreakpointSet = (state: EditorState): BreakpointSet => state.field(breakpointField)

const toggleBreakpoint = (view: EditorView, pos: number): void => {
  const breakpointSet = getBreakpointSet(view.state)
  let hasBreakpoint = false
  breakpointSet.between(pos, pos, () => {
    hasBreakpoint = true
  })
  view.dispatch({
    effects: breakpointEffect.of({
      pos,
      on: !hasBreakpoint
    })
  })
}

export const toggleBreakpointOnMouseEvent: GutterDOMEventHandler = (view, line, event) => {
  if (event instanceof MouseEvent && event.offsetY <= line.bottom) {
    toggleBreakpoint(view, line.from)
    return true
  }
  return false
}

export const breakpoints = (): Extension => {
  return [
    breakpointField,
    gutter({
      class: 'cm-breakpoints',
      markers: view => getBreakpointSet(view.state),
      initialSpacer: () => breakpointMarker,
      domEventHandlers: {
        mousedown: toggleBreakpointOnMouseEvent
      }
    }),
    EditorView.baseTheme({
      '.cm-breakpoints .cm-gutterElement': {
        width: '20px',
        padding: '0 3px 0 5px',
        color: 'red',
        cursor: 'pointer'
      }
    })
  ]
}

export const breakpointsEqual = (a: BreakpointSet, b: BreakpointSet): boolean => {
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
