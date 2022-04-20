import { RefCallback, useState, useEffect, useContext, useCallback } from 'react'
import { EditorState, EditorStateConfig } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import CodeMirrorContext, { CodeMirror } from './Context'

export const useCodeMirror = <T extends Element = Element>(
  editorStateConfig?: EditorStateConfig
): CodeMirror<T> => {
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
      initialView.destroy()
      setView(undefined)
    }
  }, [current, editorStateConfig])

  return {
    view,
    ref: refCallback
  }
}

export const useCodeMirrorView = (): EditorView | undefined => {
  const { view } = useContext(CodeMirrorContext)
  return view
}

export const useCodeMirrorRef = <T extends Element = Element>(): RefCallback<T> => {
  const { ref } = useContext(CodeMirrorContext)
  return ref
}
