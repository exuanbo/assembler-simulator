import { EditorState, StateEffect, StateField, RangeSet, Extension } from '@codemirror/state'
import { EditorView, GutterMarker, gutter } from '@codemirror/view'
import { mapEffectValue, filterEffects } from '@codemirror-toolkit/utils'
import type { DOMEventHandler as GutterDOMEventHandler } from './gutter'
import { ClassName, InternalClassName } from './classNames'

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

type BreakpointMarkerSet = RangeSet<BreakpointMarker>

const breakpointField = StateField.define<BreakpointMarkerSet>({
  create() {
    return RangeSet.empty
  },
  update(__markers, transaction) {
    const markers = __markers.map(transaction.changes)
    return filterEffects(transaction.effects, BreakpointEffect).reduce(
      (resultMarkers, effect) =>
        mapEffectValue(effect, ({ pos: targetPos, on }) =>
          resultMarkers.update(
            on
              ? { add: [breakpointMarker.range(targetPos)] }
              : { filter: from => from !== targetPos }
          )
        ),
      markers
    )
  }
})

export const getBreakpointMarkers = (state: EditorState): BreakpointMarkerSet =>
  state.field(breakpointField)

const toggleBreakpoint = (view: EditorView, pos: number): void => {
  let hasBreakpoint = false
  const breakpointMarkers = getBreakpointMarkers(view.state)
  breakpointMarkers.between(pos, pos, () => {
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
    if ((event.target as Element).classList.contains(ClassName.Breakpoint)) {
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
      class: ClassName.Breakpoint,
      markers: view => getBreakpointMarkers(view.state),
      initialSpacer: () => breakpointMarker,
      domEventHandlers: {
        mousedown: toggleBreakpointOnMouseEvent
      }
    }),
    EditorView.baseTheme({
      [`.${ClassName.Breakpoint}`]: {
        fontSize: '0.875em'
      },
      [`.${ClassName.Breakpoint} .${InternalClassName.GutterElement}`]: {
        width: '20px',
        padding: '0 3px 0 5px',
        color: 'red !important',
        cursor: 'pointer'
      }
    })
  ]
}
