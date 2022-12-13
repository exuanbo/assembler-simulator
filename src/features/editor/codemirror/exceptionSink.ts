import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

const __exceptionSink = EditorView.exceptionSink

type ExceptionSink = (handler: Parameters<typeof __exceptionSink.of>[0]) => Extension

export const exceptionSink: ExceptionSink = handler => __exceptionSink.of(handler)
