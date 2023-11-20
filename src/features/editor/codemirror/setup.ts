import type { Extension } from '@codemirror/state'
import { keymap, drawSelection } from '@codemirror/view'
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { updateListener, extensionManager } from '@codemirror-toolkit/extensions'
import { theme } from './theme'
import { asm } from './asm'
import { highlightActiveLine } from './highlightActiveLine'
import { highlightSelectionMatches } from './highlightSelectionMatches'
import { highlightActiveLineGutter } from './highlightActiveLineGutter'
import { breakpoints } from './breakpoints'
import { lineNumbers } from './lineNumbers'
import { wavyUnderline } from './wavyUnderline'
import { highlightLine } from './highlightLine'
import { indentWithTab } from './indentWithTab'

export const getSetup = (): Extension => {
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
    keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab])
  ]
}
