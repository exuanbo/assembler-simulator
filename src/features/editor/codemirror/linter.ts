import { StateField, StateEffect, Extension } from '@codemirror/state'
import { EditorView, Decoration, DecorationSet } from '@codemirror/view'

// TODO: handle message

export const linterErrorEffect = StateEffect.define<{
  add?:
    | {
        from: number
        to: number
        message: string
      }
    | undefined
  filter?: ((from: number, to: number, message: string) => boolean) | undefined
}>({
  map({ add, filter }, mapping) {
    return {
      add:
        add === undefined
          ? undefined
          : {
              from: mapping.mapPos(add.from),
              to: mapping.mapPos(add.to),
              message: add.message
            },
      filter
    }
  }
})

const createLinterErrorMark = (message: string): Decoration =>
  Decoration.mark({
    class: 'cm-linter-error',
    message
  })

const linterErrorField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(decorationSet, transaction) {
    return transaction.effects.reduce<DecorationSet>((resultSet, effect) => {
      if (!effect.is(linterErrorEffect)) {
        return resultSet
      }
      const { add, filter } = effect.value
      return resultSet.update({
        add: add === undefined ? [] : [createLinterErrorMark(add.message).range(add.from, add.to)],
        ...(filter === undefined
          ? undefined
          : {
              filter: (from, to, value) => filter(from, to, value.spec.message)
            })
      })
    }, decorationSet.map(transaction.changes))
  },
  provide: field => EditorView.decorations.from(field)
})

const errorBackgroundImage = `url('data:image/svg+xml;base64,${window.btoa(
  `<svg height="4" width="6" xmlns="http://www.w3.org/2000/svg">
  <path d="m0 3 l2 -2 l1 0 l2 2 l1 0" stroke="red" fill="none" />
</svg>`
)}')`

const linterErrorTheme = EditorView.baseTheme({
  '.cm-linter-error': {
    background: `${errorBackgroundImage} left bottom repeat-x`,
    paddingBottom: '0.125em'
  }
})

export const linter = (): Extension => [linterErrorField, linterErrorTheme]
