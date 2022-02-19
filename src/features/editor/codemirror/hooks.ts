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
  const [view, setView] = useState<EditorView | undefined>()

  const refCallback = useCallback<RefCallback<T>>(element => {
    setCurrent(element)
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
  }, [current, editorStateConfig, viewUpdateListener])

  useEffect(() => {
    if (view !== undefined) {
      return () => {
        view.destroy()
        setView(undefined)
      }
    }
  }, [view])

  return {
    view,
    editorRef: refCallback
  }
}
