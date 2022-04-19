import { RefCallback, useState, useEffect, useCallback } from 'react'
import { EditorState, EditorStateConfig } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

export const useCodeMirror = <T extends Element = Element>(
  editorStateConfig?: EditorStateConfig
): [view: EditorView | undefined, ref: RefCallback<T>] => {
  const [current, setCurrent] = useState<T | null>(null)

  const refCallback = useCallback<RefCallback<T>>(element => {
    setCurrent(element)
  }, [])

  const [view, setView] = useState<EditorView | undefined>()

  useEffect(() => {
    if (current === null) {
      return
    }
    const initialState = EditorState.create(editorStateConfig)
    const initialView = new EditorView({
      state: initialState,
      parent: current
    })
    setView(initialView)
    return () => {
      setView(undefined)
    }
  }, [current, editorStateConfig])

  useEffect(() => {
    if (view !== undefined) {
      return () => {
        view.destroy()
      }
    }
  }, [view])

  return [view, refCallback]
}
