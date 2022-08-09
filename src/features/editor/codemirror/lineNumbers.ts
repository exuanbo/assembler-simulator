import type { Extension } from '@codemirror/state'
import { EditorView, lineNumbers as __lineNumbers } from '@codemirror/view'
import { toggleBreakpointOnMouseEvent } from './breakpoints'
import type { DOMEventHandler as GutterDOMEventHandler } from './gutter'

const toggleBreakpointOnStrictMouseEvent: GutterDOMEventHandler = (view, line, event) => {
  // only when clicking on a gutter element
  if (event.target instanceof Element && event.target.classList.contains('cm-gutterElement')) {
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
      '.cm-lineNumbers .cm-gutterElement': {
        cursor: 'pointer'
      }
    })
  ]
}
