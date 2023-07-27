import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { ClassName, InternalClassName } from './classNames'

export const theme = (): Extension => {
  return EditorView.theme({
    '&': {
      height: '100%'
    },
    [`&.${InternalClassName.Focused}`]: {
      outline: '0'
    },
    [`.${InternalClassName.Scroller}`]: {
      cursor: 'text',
      fontFamily: "'Jetbrains Mono', monospace"
    },
    [`.${InternalClassName.Gutters}`]: {
      borderRight: '1px solid #e5e7eb',
      backgroundColor: '#f3f4f6', // gray-100
      cursor: 'initial',
      color: '#9ca3af' // gray-400
    },
    [`.${ClassName.Breakpoint}`]: {
      fontSize: '0.875em'
    },
    [`.${InternalClassName.LineNumbers}`]: {
      paddingRight: '6px'
    },
    [`.${InternalClassName.Cursor}`]: {
      borderLeft: '2px solid black'
    }
  })
}
