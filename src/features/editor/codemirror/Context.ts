import { createContext } from 'react'
import type { CodeMirror } from './hooks'
import { noop } from '@/common/utils'

const CodeMirrorContext = createContext<CodeMirror>({
  view: undefined,
  containerRef: noop
})

if (import.meta.env.DEV) {
  CodeMirrorContext.displayName = 'CodeMirrorContext'
}

export default CodeMirrorContext

export const { Provider: CodeMirrorProvider } = CodeMirrorContext
