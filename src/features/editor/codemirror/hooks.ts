import { useState, useEffect, useCallback } from 'react'
import { EditorState, EditorStateConfig } from '@codemirror/state'
import { EditorView, ViewUpdate } from '@codemirror/view'

export const useCodeMirror = <T extends Element = Element>(
  editorStateConfig: EditorStateConfig,
  viewUpdateHandler: (viewUpdate: ViewUpdate) => void
): {
  editorRef: (node: T) => void
  view: EditorView | undefined
} => {
  const [current, setCurrent] = useState<T | null>(null)
  const [view, setView] = useState<EditorView>()

  const refCallback = useCallback((node: T) => {
    setCurrent(node)
  }, [])

  useEffect(() => {
    if (current === null) {
      setView(undefined)
      return
    }
    const viewUpdateListener = EditorView.updateListener.of(viewUpdateHandler)
    const state = EditorState.create({
      ...editorStateConfig,
      extensions: [editorStateConfig.extensions ?? [], viewUpdateListener]
    })
    const initialView = new EditorView({
      state,
      parent: current
    })
    setView(initialView)
  }, [current])

  useEffect(() => {
    return () => {
      view?.destroy()
    }
  }, [view])

  return {
    editorRef: refCallback,
    view
  }
}
