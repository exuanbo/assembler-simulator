import type { EditorView } from '@codemirror/view'
import { RefCallback, createContext } from 'react'
import { noop } from '@/common/utils'

export interface CodeMirror<T extends Element = Element> {
  view: EditorView | undefined
  ref: RefCallback<T>
}

const CodeMirrorContext = createContext<CodeMirror>({
  view: undefined,
  ref: noop
})

if (import.meta.env.DEV) {
  CodeMirrorContext.displayName = 'CodeMirrorContext'
}

export default CodeMirrorContext
