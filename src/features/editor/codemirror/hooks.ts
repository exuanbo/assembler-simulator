import { RefCallback, useState, useEffect, useCallback } from 'react'
import { EditorState, EditorStateConfig } from '@codemirror/state'
import { EditorView, ViewUpdate } from '@codemirror/view'

export type ViewUpdateListener = (viewUpdate: ViewUpdate) => void

export const useCodeMirror = <T extends Element = Element>(
  editorStateConfig?: EditorStateConfig,
  viewUpdateListener?: ViewUpdateListener
): {
  view: EditorView | undefined
  editorRef: RefCallback<T>
} => {
  const [current, setCurrent] = useState<T | null>(null)
  const [view, setView] = useState<EditorView | undefined>(undefined)

  const refCallback = useCallback<RefCallback<T>>(node => {
    setCurrent(node)
  }, [])

  useEffect(() => {
    if (current === null) {
      setView(undefined)
      return
    }
    const initialState = EditorState.create({
      ...editorStateConfig,
      extensions: [
        editorStateConfig?.extensions ?? [],
        viewUpdateListener === undefined ? [] : EditorView.updateListener.of(viewUpdateListener)
      ]
    })
    const initialView = new EditorView({
      state: initialState,
      parent: current
    })
    setView(initialView)
  }, [current])

  useEffect(() => {
    if (view !== undefined) {
      return () => {
        view.destroy()
      }
    }
  }, [view])

  return {
    view,
    editorRef: refCallback
  }
}
