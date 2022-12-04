import { StateEffect, StateField, Extension } from '@codemirror/state'
import { EditorView, ViewUpdate } from '@codemirror/view'

type ViewUpdateListener = (update: ViewUpdate) => void

const ViewUpdateListenerEffect = StateEffect.define<{
  [actionName in 'add' | 'remove']?: ViewUpdateListener
}>()

type Unsubscribe = () => void

export const listenViewUpdate = (view: EditorView, listener: ViewUpdateListener): Unsubscribe => {
  view.dispatch({
    effects: ViewUpdateListenerEffect.of({ add: listener })
  })
  return () => {
    view.dispatch({
      effects: ViewUpdateListenerEffect.of({ remove: listener })
    })
  }
}

interface SetRef<T> {
  readonly current: Set<T>
}

/**
 * @returns `false` if the set is not changed
 */
type UpdateSet<T> = (set: Set<T>) => Set<T> | boolean

const updateSetRef = <T>(setRef: SetRef<T>, update: UpdateSet<T>): SetRef<T> => {
  const { current: set } = setRef
  const isChanged = update(set)
  return isChanged === false ? setRef : { current: set }
}

const viewUpdateListenerField = StateField.define<SetRef<ViewUpdateListener>>({
  create() {
    return { current: new Set() }
  },
  update(listenerSetRef, transaction) {
    return transaction.effects.reduce((resultSetRef, effect) => {
      if (!effect.is(ViewUpdateListenerEffect)) {
        return resultSetRef
      }
      const { add: listenerToAdd, remove: listenerToRemove } = effect.value
      let currentSetRef = resultSetRef
      currentSetRef = updateSetRef(
        currentSetRef,
        set => listenerToAdd !== undefined && !set.has(listenerToAdd) && set.add(listenerToAdd)
      )
      currentSetRef = updateSetRef(
        currentSetRef,
        set => listenerToRemove !== undefined && set.delete(listenerToRemove)
      )
      return currentSetRef
    }, listenerSetRef)
  },
  provide: thisField =>
    EditorView.updateListener.computeN([thisField], state => {
      const listenerSetRef = state.field(thisField)
      return [...listenerSetRef.current]
    })
})

export const viewUpdateListener = (): Extension => viewUpdateListenerField
