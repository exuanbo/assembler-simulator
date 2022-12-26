import {
  RefCallback,
  EffectCallback,
  DependencyList,
  useState,
  useEffect,
  useContext,
  useMemo
} from 'react'
import { EditorViewConfig, EditorView } from '@codemirror/view'
import CodeMirrorContext from './Context'

export type CodeMirrorConfig = Pick<EditorViewConfig, 'doc' | 'extensions'>

export interface CodeMirror<T extends Element = Element> {
  view: EditorView | undefined
  containerRef: RefCallback<T>
}

export const useCodeMirror = <T extends Element = Element>(
  config?: CodeMirrorConfig
): CodeMirror<T> => {
  const [container, setContainer] = useState<T | null>(null)
  const [view, setView] = useState<EditorView | undefined>()

  useEffect(() => {
    if (container === null) {
      return
    }
    const currentView = new EditorView({
      parent: container,
      root: document,
      ...config
    })
    setView(currentView)
    return () => {
      currentView.destroy()
      setView(undefined)
    }
  }, [container, config])

  const codeMirror = useMemo<CodeMirror<T>>(() => {
    return {
      view,
      containerRef: setContainer
    }
  }, [view])
  return codeMirror
}

export const useView = (): EditorView | undefined => {
  const { view } = useContext(CodeMirrorContext)
  return view
}

type ViewEffectCallback = (view: EditorView) => ReturnType<EffectCallback>

export const useViewEffect = (effect: ViewEffectCallback, deps: DependencyList): void => {
  const view = useView()
  useEffect(() => {
    if (view !== undefined) {
      return effect(view)
    }
  }, [view, ...deps])
}

export const useContainerRef = <T extends Element = Element>(): RefCallback<T> => {
  const { containerRef } = useContext(CodeMirrorContext)
  return containerRef
}
