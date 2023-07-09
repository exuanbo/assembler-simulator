import type { Extension } from '@codemirror/state'
import {
  StreamLanguage,
  LanguageSupport,
  IndentContext,
  syntaxHighlighting,
  defaultHighlightStyle,
  indentUnit,
  indentService
} from '@codemirror/language'
import { Mnemonic, MnemonicToOperandCountMap } from '@/common/constants'

/* eslint-disable prettier/prettier */

const SKIPABLE_CHARACTER_REGEXP = /[,[\]:]/
const LABEL_DECLARATION_REGEXP =  /^[a-zA-Z_]+(?=:)/
const LABEL_REFERENCE_REGEXP =    /^[a-zA-Z_]+/
const MAYBE_INSTRUCTION_REGEXP =  /^[^\s;:,["]+/
const NUMBER_REGEXP =             /^[\da-fA-F]+\b/
const REGISTER_REGEXP =           /^[a-dA-D][lL]\b/
const STRING_REGEXP =             /^"(?:(?:[^\\]|\\.)*?"|.*)/
const NON_WHITESPACE_REGEXP =     /^\S+/

/* eslint-enable prettier/prettier */

interface State {
  ended: boolean
  operandsLeft: number
  expectingLabel: boolean
}

const startState = (): State => {
  return {
    ended: false,
    operandsLeft: 0,
    expectingLabel: false
  }
}

const asmLanguage = StreamLanguage.define<State>({
  name: 'asm',
  startState,
  token(stream, state) {
    if (state.ended) {
      stream.skipToEnd()
      return 'comment'
    }
    /* eslint-disable @typescript-eslint/strict-boolean-expressions */
    if (stream.eatSpace() || stream.eat(SKIPABLE_CHARACTER_REGEXP)) {
      return null
    }
    if (stream.eat(';')) {
      stream.skipToEnd()
      return 'comment'
    }
    if (stream.match(LABEL_DECLARATION_REGEXP)) {
      state.operandsLeft = 0
      return 'labelName'
    }
    if (!state.operandsLeft) {
      if (stream.match(MAYBE_INSTRUCTION_REGEXP)) {
        const upperCaseToken = stream.current().toUpperCase()
        if (upperCaseToken in Mnemonic) {
          const mnemonic = upperCaseToken as Mnemonic
          if (mnemonic === Mnemonic.END) {
            state.ended = true
          }
          state.operandsLeft = MnemonicToOperandCountMap[mnemonic]
          state.expectingLabel = mnemonic.startsWith('J')
          return 'keyword'
        } else {
          return null
        }
      }
    } else {
      if (stream.match(NUMBER_REGEXP)) {
        state.operandsLeft -= 1
        return 'number'
      }
      if (stream.match(REGISTER_REGEXP)) {
        state.operandsLeft -= 1
        return 'variableName.special'
      }
      if (stream.match(STRING_REGEXP)) {
        state.operandsLeft -= 1
        return 'string'
      }
      if (state.expectingLabel && stream.match(LABEL_REFERENCE_REGEXP)) {
        state.operandsLeft -= 1
        state.expectingLabel = false
        return 'labelName'
      }
      state.operandsLeft = 0
    }
    /* eslint-enable @typescript-eslint/strict-boolean-expressions */
    stream.match(NON_WHITESPACE_REGEXP)
    return null
  }
})

const INDENT_UNIT = '\t'

const LEADING_SPACE_REGEXP = /^ */
const LEADING_WHITESPACE_REGEXP = /^\s*/

const computeIndentation = ({ state }: IndentContext, pos: number): number => {
  const trimmedLine = state.doc.lineAt(pos).text.replace(LEADING_SPACE_REGEXP, '')
  const whitespaces = LEADING_WHITESPACE_REGEXP.exec(trimmedLine)?.[0].split('') ?? []
  const tabCount = whitespaces.reduce((acc, char) => (char === '\t' ? acc + 1 : acc), 0)
  const spaceCount = whitespaces.length - tabCount
  return tabCount * state.tabSize + spaceCount
}

export const asm = (): Extension => {
  return [
    new LanguageSupport(asmLanguage),
    syntaxHighlighting(defaultHighlightStyle),
    indentUnit.of(INDENT_UNIT),
    indentService.of(computeIndentation)
  ]
}
