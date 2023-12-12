import type { Extension } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import { addExtension, removeExtension } from '@codemirror-toolkit/extensions'
import { defer, from, map } from 'rxjs'

import { invariant } from '@/common/utils'

// TODO: import from @codemirror-toolkit/extensions
type ExtensionObject = Exclude<Extension, readonly Extension[]>

interface VimExtension extends ExtensionObject {
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
