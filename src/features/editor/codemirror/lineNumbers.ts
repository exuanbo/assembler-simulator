import type { Extension } from '@codemirror/state'
import { lineNumbers as __lineNumbers } from '@codemirror/gutter'
import { toggleBreakpoint } from './breakpoints'

export const lineNumbers = (): Extension =>
  __lineNumbers({
    domEventHandlers: {
      mousedown(view, line) {
        toggleBreakpoint(view, line.from)
        return true
      }
    }
  })
