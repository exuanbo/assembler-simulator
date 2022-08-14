import { StateEffect, StateField, Extension } from '@codemirror/state'
import { EditorView, ViewUpdate } from '@codemirror/view'

type ViewUpdateListener = (update: ViewUpdate) => void

const viewUpdateListenerEffect = StateEffect.define<{
  add?: ViewUpdateListener
  remove?: ViewUpdateListener
}>()

type Unsubscribe = () => void

export const listenViewUpdate = (view: EditorView, listener: ViewUpdateListener): Unsubscribe => {
  view.dispatch({
    effects: viewUpdateListenerEffect.of({ add: listener })
  })
  return () => {
    view.dispatch({
      effects: viewUpdateListenerEffect.of({ remove: listener })
    })
  }
}

const viewUpdateListenerField = StateField.define<Set<ViewUpdateListener>>({
  create() {
    return new Set()
  },
  update(listenerSet, transaction) {
    return transaction.effects.reduce((resultSet, effect) => {
      if (!effect.is(viewUpdateListenerEffect)) {
        return resultSet
      }
      let updatedSet = resultSet
      const { add: listenerToAdd, remove: listenerToRemove } = effect.value
      if (listenerToAdd !== undefined && !updatedSet.has(listenerToAdd)) {
        updatedSet = new Set(updatedSet)
        updatedSet.add(listenerToAdd)
      }
      if (listenerToRemove !== undefined && updatedSet.has(listenerToRemove)) {
        updatedSet = new Set(updatedSet)
        updatedSet.delete(listenerToRemove)
      }
      return updatedSet
    }, listenerSet)
  },
  provide: currentField =>
    EditorView.updateListener.computeN([currentField], state => [...state.field(currentField)])
})

export const viewUpdateListener = (): Extension => viewUpdateListenerField
