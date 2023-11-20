import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { addExtension, removeExtension } from '@codemirror-toolkit/extensions'

// TODO: use satisfies operator
let initialized = false
const vim: Extension = { extension: [] }

export const initVim = async (): Promise<void> => {
  if (initialized) {
    return
  }
  const { vim: __vim } = await import('@replit/codemirror-vim')
  vim.extension = __vim({ status: true })
  initialized = true
}

export const enableVim = (view: EditorView): void => {
  addExtension(view, vim)
}

export const disableVim = (view: EditorView): void => {
  removeExtension(view, vim)
}
