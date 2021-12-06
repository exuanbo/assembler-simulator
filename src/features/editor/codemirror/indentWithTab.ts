import type { KeyBinding } from '@codemirror/view'
import { insertTab, indentLess } from '@codemirror/commands'

export const indentWithTab: KeyBinding = {
  key: 'Tab',
  run: insertTab,
  shift: indentLess
}
