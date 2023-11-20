import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { vim as __vim } from '@replit/codemirror-vim'
import { addExtension, removeExtension } from '@codemirror-toolkit/extensions'

let initialized = false
const vim: Extension = { extension: [] }

const initVim = (): void => {
  if (initialized) {
    return
  }
  vim.extension = __vim({ status: true })
  initialized = true
}

export const enableVim = (view: EditorView): void => {
  initVim()
  addExtension(view, vim)
}

export const disableVim = (view: EditorView): void => {
  removeExtension(view, vim)
}
