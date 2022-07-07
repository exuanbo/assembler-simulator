import {
  RefCallback,
  EffectCallback,
  DependencyList,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback
} from 'react'
import { EditorViewConfig, EditorView } from '@codemirror/view'
import CodeMirrorContext from './Context'

type CodeMirrorConfig = Omit<EditorViewConfig, 'state' | 'parent' | 'root'>

export interface CodeMirror<T extends Element = Element> {
  view: EditorView | undefined
  ref: RefCallback<T>
}

export const useCodeMirror = <T extends Element = Element>(
  config?: CodeMirrorConfig
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
    const initialView = new EditorView({
      ...config,
      parent: current,
      root: document
    })
    setView(initialView)
    return () => {
      initialView.destroy()
      setView(undefined)
    }
  }, [current, config])

  return {
    view,
    ref: refCallback
  }
}

export const useCodeMirrorView = (): EditorView | undefined => {
  const { view } = useContext(CodeMirrorContext)
  return view
}

type ViewEffectCallback = (view: EditorView) => ReturnType<EffectCallback>

export const useCodeMirrorViewEffect = (
  effect: ViewEffectCallback,
  deps?: DependencyList
): void => {
  const view = useCodeMirrorView()
  const flag = useRef(0)

  useEffect(() => {
    flag.current ^= 1
    if (view !== undefined) {
      return effect(view)
    }
  }, [view, ...(deps ?? [flag.current])])
}

export const useCodeMirrorRef = <T extends Element = Element>(): RefCallback<T> => {
  const { ref } = useContext(CodeMirrorContext)
  return ref
}
