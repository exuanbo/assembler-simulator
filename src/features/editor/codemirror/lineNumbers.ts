import type { Extension } from '@codemirror/state'
import { EditorView, lineNumbers as __lineNumbers } from '@codemirror/view'
import { toggleBreakpointOnMouseEvent } from './breakpoints'

export const lineNumbers = (): Extension => [
  __lineNumbers({
    domEventHandlers: {
      mousedown: (view, line, event) => {
        const { target } = event
        if (target instanceof Element && target.classList.contains('cm-gutterElement')) {
          return toggleBreakpointOnMouseEvent(view, line, event)
        }
        return false
      }
    }
  }),
  EditorView.baseTheme({
    '.cm-lineNumbers .cm-gutterElement': {
      cursor: 'pointer'
    }
  })
]
