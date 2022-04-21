import type { Extension } from '@codemirror/state'
import { lineNumbers as __lineNumbers } from '@codemirror/view'
import { toggleBreakpointOnMouseEvent } from './breakpoints'

export const lineNumbers = (): Extension =>
  __lineNumbers({
    domEventHandlers: {
      mousedown: toggleBreakpointOnMouseEvent
    }
  })
