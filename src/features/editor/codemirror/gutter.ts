import type { EditorView, BlockInfo } from '@codemirror/view'

export type DOMEventHandler = (view: EditorView, line: BlockInfo, event: Event) => boolean
