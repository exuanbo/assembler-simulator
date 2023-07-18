import { EditorState, StateEffect, StateField, RangeSet, Extension } from '@codemirror/state'
import { EditorView, GutterMarker, gutter } from '@codemirror/view'
import { isEffectOfType, mapEffectValue } from '@codemirror-toolkit/utils'
import type { DOMEventHandler as GutterDOMEventHandler } from './gutter'

export const BreakpointEffect = StateEffect.define<{
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
  public override eq(other: GutterMarker): boolean {
    return other instanceof BreakpointMarker
  }

  public override toDOM(): Text {
    return document.createTextNode('●')
  }
}

const breakpointMarker = new BreakpointMarker()

type BreakpointSet = RangeSet<BreakpointMarker>

const breakpointField = StateField.define<BreakpointSet>({
  create() {
    return RangeSet.empty
  },
  update(breakpoints, transaction) {
    return transaction.effects
      .filter(isEffectOfType(BreakpointEffect))
      .reduce(
        (resultBreakpoints, effect) =>
          mapEffectValue(effect, ({ pos: targetPos, on: shouldTurnOn }) =>
            resultBreakpoints.update(
              shouldTurnOn
                ? { add: [breakpointMarker.range(targetPos)] }
                : { filter: from => from !== targetPos }
            )
          ),
        breakpoints.map(transaction.changes)
      )
  }
})

export const getBreakpointSet = (state: EditorState): BreakpointSet => state.field(breakpointField)

const toggleBreakpoint = (view: EditorView, pos: number): void => {
  let hasBreakpoint = false
  const breakpointSet = getBreakpointSet(view.state)
  breakpointSet.between(pos, pos, () => {
    hasBreakpoint = true
  })
  view.dispatch({
    effects: BreakpointEffect.of({
      pos,
      on: !hasBreakpoint
    })
  })
}

export const toggleBreakpointOnMouseEvent: GutterDOMEventHandler = (view, line, event) => {
  if (event instanceof MouseEvent && event.offsetY <= line.bottom) {
    // matches cursor style
    if ((event.target as Element).classList.contains('cm-breakpoints')) {
      return false
    }
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
        color: 'red !important',
        cursor: 'pointer'
      }
    })
  ]
}
