import type { Extension } from '@codemirror/state'
import { lineNumbers as __lineNumbers } from '@codemirror/view'
import { toggleBreakpoint } from './breakpoints'

export const lineNumbers = (): Extension =>
  __lineNumbers({
    domEventHandlers: {
      mousedown(view, line, event) {
        if ((event as MouseEvent).offsetY > line.bottom) {
          return false
        }
        toggleBreakpoint(view, line.from)
        return true
      }
    }
  })
