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

  const refCallback = useCallback<RefCallback<T>>(element => {
    setCurrent(element)
  }, [])

  const [view, setView] = useState<EditorView | undefined>()

  useEffect(() => {
    if (current === null) {
      return
    }
    setView(
      new EditorView({
        state: EditorState.create({
          ...editorStateConfig,
          extensions: [
            editorStateConfig?.extensions ?? [],
            viewUpdateListener === undefined ? [] : EditorView.updateListener.of(viewUpdateListener)
          ]
        }),
        parent: current
      })
    )
    return () => {
      setView(undefined)
    }
  }, [current, editorStateConfig, viewUpdateListener])

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
