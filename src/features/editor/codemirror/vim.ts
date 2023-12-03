import type { Extension } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import { addExtension, removeExtension } from '@codemirror-toolkit/extensions'
import { defer, from, map } from 'rxjs'

const vim = {
  initialized: false,
  extension: [] as Extension,
}

export const initVim$ = defer(() =>
  vim.initialized
    ? from(Promise.resolve())
    : from(import('@replit/codemirror-vim')).pipe(
        map((module) => {
          vim.extension = module.vim({ status: true })
          vim.initialized = true
        }),
      ),
)

export const enableVim = (view: EditorView): void => {
  if (!vim.initialized) {
    throw new Error('Vim extension not initialized.')
  }
  addExtension(view, vim)
}

export const disableVim = (view: EditorView): void => {
  removeExtension(view, vim)
  vim.extension = []
  vim.initialized = false
}
