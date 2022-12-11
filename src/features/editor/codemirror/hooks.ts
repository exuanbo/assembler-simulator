import {
  RefCallback,
  EffectCallback,
  DependencyList,
  useState,
  useEffect,
  useContext,
  useMemo,
  useRef
} from 'react'
import { EditorViewConfig, EditorView } from '@codemirror/view'
import CodeMirrorContext from './Context'

export type CodeMirrorConfig = Pick<EditorViewConfig, 'doc' | 'extensions'>

export interface CodeMirror<T extends Element = Element> {
  view: EditorView | undefined
  ref: RefCallback<T>
}

export const useCodeMirror = <T extends Element = Element>(
  config?: CodeMirrorConfig
): CodeMirror<T> => {
  const [refElement, setRefElement] = useState<T | null>(null)
  const [currentView, setCurrentView] = useState<EditorView | undefined>()

  useEffect(() => {
    if (refElement === null) {
      return
    }
    const view = new EditorView({
      root: document,
      parent: refElement,
      ...config
    })
    setCurrentView(view)
    return () => {
      view.destroy()
      setCurrentView(undefined)
    }
  }, [refElement, config])

  const codeMirror = useMemo<CodeMirror<T>>(() => {
    return {
      view: currentView,
      ref: setRefElement
    }
  }, [currentView])
  return codeMirror
}

export const useCodeMirrorView = (): EditorView | undefined => {
  const { view } = useContext(CodeMirrorContext)
  return view
}

type CodeMirrorEffectCallback = (view: EditorView) => ReturnType<EffectCallback>

export const useCodeMirrorEffect = (
  effect: CodeMirrorEffectCallback,
  deps?: DependencyList
): void => {
  const view = useCodeMirrorView()
  const flag = useRef(1)

  useEffect(() => {
    flag.current <<= 1
    if (view !== undefined) {
      return effect(view)
    }
  }, [view, ...(deps ?? [flag.current])])
}

export const useCodeMirrorRef = <T extends Element = Element>(): RefCallback<T> => {
  const { ref } = useContext(CodeMirrorContext)
  return ref
}
