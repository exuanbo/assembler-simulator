import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import type { Extension } from '@codemirror/state'
import { drawSelection, keymap } from '@codemirror/view'
import { extensionManager, updateListener } from '@codemirror-toolkit/extensions'

import { asm } from './asm'
import { breakpoints } from './breakpoints'
import { highlightActiveLine } from './highlightActiveLine'
import { highlightActiveLineGutter } from './highlightActiveLineGutter'
import { highlightLine } from './highlightLine'
import { highlightSelectionMatches } from './highlightSelectionMatches'
import { indentWithTab } from './indentWithTab'
import { lineNumbers } from './lineNumbers'
import { theme } from './theme'
import { wavyUnderline } from './wavyUnderline'

export const setup = (): Extension => {
  return [
    drawSelection(),
    history(),
    closeBrackets(),
    updateListener(),
    extensionManager(),
    theme(),
    asm(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    highlightActiveLineGutter(),
    breakpoints(),
    lineNumbers(),
    wavyUnderline(),
    highlightLine(),
    keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
  ]
}
