import { StateEffect, StateField, Extension } from '@codemirror/state'
import { EditorView, ViewUpdate } from '@codemirror/view'
import type { NonNullishValue, Nullable } from '@/common/utils'

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

class SetWrapper<T extends NonNullishValue> {
  private readonly _set: Set<T>

  constructor(set: Set<T> = new Set()) {
    this._set = set
  }

  public unwrap(): Set<T> {
    return this._set
  }

  public addNullable(value: Nullable<T>): SetWrapper<T> {
    if (value == null || this._set.has(value)) {
      return this
    }
    this._set.add(value)
    return new SetWrapper(this._set)
  }

  public deleteNullable(value: Nullable<T>): SetWrapper<T> {
    if (value == null || !this._set.has(value)) {
      return this
    }
    this._set.delete(value)
    return new SetWrapper(this._set)
  }
}

type ViewUpdateListenerSetWrapper = SetWrapper<ViewUpdateListener>

const viewUpdateListenersField = StateField.define<ViewUpdateListenerSetWrapper>({
  create() {
    return new SetWrapper()
  },
  update(listenerSetWrapper, transaction) {
    return transaction.effects.reduce(
      (resultSetWrapper, effect) =>
        effect.is(ViewUpdateListenerEffect)
          ? resultSetWrapper.deleteNullable(effect.value.remove).addNullable(effect.value.add)
          : resultSetWrapper,
      listenerSetWrapper
    )
  },
  provide: thisField =>
    EditorView.updateListener.computeN([thisField], state => {
      const listenerSetWrapper = state.field(thisField)
      return [...listenerSetWrapper.unwrap()]
    })
})

export const viewUpdateListener = (): Extension => viewUpdateListenersField
