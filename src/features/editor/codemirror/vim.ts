import type { EditorView } from '@codemirror/view'
import { addExtension, type FlatExtension, removeExtension } from '@codemirror-toolkit/extensions'
import { defer, from, map } from 'rxjs'

import { invariant } from '@/common/utils'

interface VimExtension extends FlatExtension {
  initialized: boolean
}

const vim: VimExtension = {
  extension: [],
  initialized: false,
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
  invariant(vim.initialized, 'Vim extension not initialized.')
  addExtension(view, vim)
}

export const disableVim = (view: EditorView): void => {
  removeExtension(view, vim)
  vim.extension = []
  vim.initialized = false
}
