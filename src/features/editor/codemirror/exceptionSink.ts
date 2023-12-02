import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

const __exceptionSink = EditorView.exceptionSink

type ExceptionHandler = (exception: unknown) => void
type ExceptionSink = (handler: ExceptionHandler) => Extension

export const exceptionSink: ExceptionSink = (handler) => __exceptionSink.of(handler)
