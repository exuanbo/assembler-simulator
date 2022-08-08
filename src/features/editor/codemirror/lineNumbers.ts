import type { Extension } from '@codemirror/state'
import { EditorView, lineNumbers as __lineNumbers } from '@codemirror/view'
import { toggleBreakpointOnMouseEvent } from './breakpoints'
import type { DOMEventHandler as GutterDOMEventHandler } from './gutter'

const toggleBreakpointOnStrictMouseEvent: GutterDOMEventHandler = (view, line, event) => {
  const { target } = event
  // only when clicking on a gutter element
  if (target instanceof Element && target.classList.contains('cm-gutterElement')) {
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
