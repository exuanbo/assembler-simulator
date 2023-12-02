import { createCodeMirrorWithContext } from '@codemirror-toolkit/react'

export const {
  Provider: CodeMirrorProvider,
  useViewEffect,
  useContainerRef,
} = createCodeMirrorWithContext<HTMLDivElement>(import.meta.env.DEV && 'CodeMirrorContext')
