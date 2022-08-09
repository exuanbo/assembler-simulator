import { StateEffect, TransactionSpec } from '@codemirror/state'
import { EditorView, ViewUpdate } from '@codemirror/view'

export type ViewUpdateListener = (update: ViewUpdate) => void

export const addViewUpdateListener = (viewUpdateListener: ViewUpdateListener): TransactionSpec => {
  return {
    effects: StateEffect.appendConfig.of(EditorView.updateListener.of(viewUpdateListener))
  }
}
