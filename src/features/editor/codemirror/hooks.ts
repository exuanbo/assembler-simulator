import React, { useState, useEffect, useCallback } from 'react'
import { EditorState, EditorStateConfig } from '@codemirror/state'
import { EditorView, ViewUpdate } from '@codemirror/view'

export const useCodeMirror = <T extends Element = Element>(
  editorStateConfig: EditorStateConfig,
  handleViewUpdate?: (viewUpdate: ViewUpdate) => void
): {
  view: EditorView | undefined
  editorRef: React.RefCallback<T>
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
    const state = EditorState.create({
      ...editorStateConfig,
      extensions: [
        editorStateConfig.extensions ?? [],
        handleViewUpdate === undefined ? [] : EditorView.updateListener.of(handleViewUpdate)
      ]
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
    view,
    editorRef: refCallback
  }
}
