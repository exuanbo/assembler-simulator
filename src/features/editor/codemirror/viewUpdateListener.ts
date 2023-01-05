import { StateEffect, StateField, Extension } from '@codemirror/state'
import { EditorView, ViewUpdate } from '@codemirror/view'
import { mapStateEffectValue } from './state'
import type { NonNullishValue, Nullable } from '@/common/utils'

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

class SetProxy<T extends NonNullishValue> {
  private readonly _set: Set<T>

  constructor(set: Set<T> = new Set()) {
    this._set = set
  }

  public unwrap(): Set<T> {
    return this._set
  }

  public addNullable(value: Nullable<T>): SetProxy<T> {
    if (value == null || this._set.has(value)) {
      return this
    }
    this._set.add(value)
    return new SetProxy(this._set)
  }

  public deleteNullable(value: Nullable<T>): SetProxy<T> {
    if (value == null || !this._set.has(value)) {
      return this
    }
    this._set.delete(value)
    return new SetProxy(this._set)
  }
}

type ViewUpdateListenerSetProxy = SetProxy<ViewUpdateListener>

const viewUpdateListenersField = StateField.define<ViewUpdateListenerSetProxy>({
  create() {
    return new SetProxy()
  },
  update(listeners, transaction) {
    return transaction.effects.reduce(
      (resultListeners, effect) =>
        effect.is(ViewUpdateListenerEffect)
          ? mapStateEffectValue(effect, listenerAction =>
              resultListeners.deleteNullable(listenerAction.remove).addNullable(listenerAction.add)
            )
          : resultListeners,
      listeners
    )
  },
  provide: thisField =>
    EditorView.updateListener.computeN([thisField], state => {
      const listenerSetProxy = state.field(thisField)
      return [...listenerSetProxy.unwrap()]
    })
})

export const viewUpdateListener = (): Extension => viewUpdateListenersField
