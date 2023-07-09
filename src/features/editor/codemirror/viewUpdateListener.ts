import { StateEffect, StateField, Extension } from '@codemirror/state'
import { EditorView, ViewUpdate } from '@codemirror/view'
import { mapStateEffectValue } from './state'
import { maybeNullable } from '@/common/utils'

type ViewUpdateListener = (update: ViewUpdate) => void

interface ViewUpdateListenerAction {
  add?: ViewUpdateListener
  remove?: ViewUpdateListener
}

const ViewUpdateListenerEffect = StateEffect.define<ViewUpdateListenerAction>()

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

type ViewUpdateListenerSet = Set<ViewUpdateListener>

const viewUpdateListenersField = StateField.define<ViewUpdateListenerSet>({
  create() {
    return new Set()
  },
  update(listeners, transaction) {
    return transaction.effects.reduce(
      (resultListeners, effect) =>
        effect.is(ViewUpdateListenerEffect)
          ? mapStateEffectValue(effect, ({ add, remove }) => {
              const updatedListeners = new Set(resultListeners)
              maybeNullable(add).ifJust(listener => updatedListeners.add(listener))
              maybeNullable(remove).ifJust(listener => updatedListeners.delete(listener))
              return updatedListeners
            })
          : resultListeners,
      listeners
    )
  },
  compare(xs, ys) {
    return xs === ys || (xs.size === ys.size && [...xs].every(x => ys.has(x)))
  },
  provide: thisField =>
    EditorView.updateListener.compute([thisField], state => {
      const listenerSet = state.field(thisField)
      return update => {
        listenerSet.forEach(listener => listener(update))
      }
    })
})

export const viewUpdateListener = (): Extension => viewUpdateListenersField
