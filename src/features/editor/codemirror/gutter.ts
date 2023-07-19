import type { gutter } from '@codemirror/view'

type GutterConfig = Required<Parameters<typeof gutter>[0]>

type DOMEventHandlers = GutterConfig['domEventHandlers']

type DOMEventName = keyof DOMEventHandlers

export type DOMEventHandler = DOMEventHandlers[DOMEventName]
