import type { Extension } from '@codemirror/state'
import { EditorView, lineNumbers as __lineNumbers } from '@codemirror/view'

import { invariant } from '@/common/utils'

import { toggleBreakpointOnMouseEvent } from './breakpoints'
import { InternalClassName } from './classNames'
import type { DOMEventHandler as GutterDOMEventHandler } from './gutter'

const toggleBreakpointOnStrictMouseEvent: GutterDOMEventHandler = (view, line, event) => {
  invariant(event.target instanceof Element)
  // only when clicking on a gutter element
  if (event.target.classList.contains(InternalClassName.GutterElement)) {
    return toggleBreakpointOnMouseEvent(view, line, event)
  }
  return false
}

export const lineNumbers = (): Extension => {
  return [
    __lineNumbers({
      domEventHandlers: {
        mousedown: toggleBreakpointOnStrictMouseEvent,
      },
    }),
    EditorView.baseTheme({
      [`.${InternalClassName.LineNumbers}`]: {
        paddingRight: '6px',
      },
      [`.${InternalClassName.LineNumbers} .${InternalClassName.GutterElement}`]: {
        cursor: 'pointer',
      },
    }),
  ]
}
