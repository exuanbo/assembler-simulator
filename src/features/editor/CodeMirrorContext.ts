import { createContext } from 'react'
import type { EditorView } from '@codemirror/view'

const CodeMirrorContext = createContext<EditorView | undefined>(undefined)

if (import.meta.env.DEV) {
  CodeMirrorContext.displayName = 'CodeMirrorContext'
}

export default CodeMirrorContext
