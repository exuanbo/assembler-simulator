import type { Extension } from '@codemirror/state'
import { EditorView, lineNumbers as __lineNumbers } from '@codemirror/view'
import { toggleBreakpointOnMouseEvent } from './breakpoints'
import type { DOMEventHandler as GutterDOMEventHandler } from './gutter'
import { InternalClassName } from './classNames'

const toggleBreakpointOnStrictMouseEvent: GutterDOMEventHandler = (view, line, event) => {
  // only when clicking on a gutter element
  if ((event.target as Element).classList.contains(InternalClassName.GutterElement)) {
    return toggleBreakpointOnMouseEvent(view, line, event)
  }
  return false
}

export const lineNumbers = (): Extension => {
  return [
    __lineNumbers({
      domEventHandlers: {
        mousedown: toggleBreakpointOnStrictMouseEvent
      }
    }),
    EditorView.baseTheme({
      [`.${InternalClassName.LineNumbers}`]: {
        paddingRight: '6px'
      },
      [`.${InternalClassName.LineNumbers} .${InternalClassName.GutterElement}`]: {
        cursor: 'pointer'
      }
    })
  ]
}
