import {
  defaultHighlightStyle,
  indentUnit,
  LanguageSupport,
  StreamLanguage,
  syntaxHighlighting,
} from '@codemirror/language'
import type { Extension } from '@codemirror/state'

import { Mnemonic, MnemonicToOperandCountMap } from '@/common/constants'

// prettier-ignore
const TokenRegExp = {
  SKIPABLE_CHARACTER: /[,[\]:]/,
  LABEL_DECLARATION:  /^[a-zA-Z_]+(?=:)/,
  LABEL_REFERENCE:    /^[a-zA-Z_]+/,
  NUMBER:             /^[\da-fA-F]+\b/,
  REGISTER:           /^[a-dA-D][lL]\b/,
  STRING:             /^"(?:(?:[^\\]|\\.)*?"|.*)/,
  UNKNOWN:            /^[^\s;:,["]+/,
  NON_WHITESPACE:     /^\S+/
} as const

interface State {
  ended: boolean
  operandsLeft: number
  expectingLabel: boolean
}

const startState = (): State => {
  return {
    ended: false,
    operandsLeft: 0,
    expectingLabel: false,
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

    if (stream.eatSpace() || stream.eat(TokenRegExp.SKIPABLE_CHARACTER)) {
      return null
    }
    if (stream.eat(';')) {
      stream.skipToEnd()
      return 'comment'
    }
    if (stream.match(TokenRegExp.LABEL_DECLARATION)) {
      state.operandsLeft = 0
      return 'labelName'
    }
    if (state.operandsLeft) {
      if (stream.match(TokenRegExp.NUMBER)) {
        state.operandsLeft -= 1
        return 'number'
      }
      if (stream.match(TokenRegExp.REGISTER)) {
        state.operandsLeft -= 1
        return 'variableName.special'
      }
      if (stream.match(TokenRegExp.STRING)) {
        state.operandsLeft -= 1
        return 'string'
      }
      if (state.expectingLabel && stream.match(TokenRegExp.LABEL_REFERENCE)) {
        state.operandsLeft -= 1
        state.expectingLabel = false
        return 'labelName'
      }
      state.operandsLeft = 0
    } else if (stream.match(TokenRegExp.UNKNOWN)) {
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

    stream.match(TokenRegExp.NON_WHITESPACE)
    return null
  },
  indent(_state, _textAfter, context) {
    const { selection, tabSize } = context.state
    const pos = selection.main.from
    const indentation = context.lineAt(pos, -1).text.match(/^\s+/)?.[0] ?? ''
    const whitespaces = indentation
      .replace(new RegExp(` {${tabSize}}`, 'g'), '\t')
      .replace(/ +(?=\t)/g, '')
      .split('')
    const tabCount = whitespaces.reduce((acc, char) => (char === '\t' ? acc + 1 : acc), 0)
    const spaceCount = whitespaces.length - tabCount
    return tabCount * tabSize + spaceCount
  },
})

export const asm = (): Extension => {
  return [
    new LanguageSupport(asmLanguage, [indentUnit.of('\t')]),
    syntaxHighlighting(defaultHighlightStyle),
  ]
}
