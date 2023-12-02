import { indentLess, insertTab } from '@codemirror/commands'
import type { KeyBinding } from '@codemirror/view'

export const indentWithTab: KeyBinding = {
  key: 'Tab',
  run: insertTab,
  shift: indentLess,
}
