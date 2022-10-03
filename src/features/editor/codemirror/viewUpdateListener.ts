import { StateEffect, StateField, Extension } from '@codemirror/state'
import { EditorView, ViewUpdate } from '@codemirror/view'

type ViewUpdateListener = (update: ViewUpdate) => void

const ViewUpdateListenerEffect = StateEffect.define<{
  add?: ViewUpdateListener
  remove?: ViewUpdateListener
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

const viewUpdateListenerField = StateField.define<Set<ViewUpdateListener>>({
  create() {
    return new Set()
  },
  update(listenerSet, transaction) {
    return transaction.effects.reduce((resultSet, effect) => {
      if (!effect.is(ViewUpdateListenerEffect)) {
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
  provide: thisField =>
    EditorView.updateListener.computeN([thisField], state => [...state.field(thisField)])
})

export const viewUpdateListener = (): Extension => viewUpdateListenerField
