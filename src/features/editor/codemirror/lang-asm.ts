/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import type { Extension } from '@codemirror/state'
import { StreamLanguage } from '@codemirror/stream-parser'
import { LanguageSupport, indentUnit, indentService } from '@codemirror/language'
import { Mnemonic, MnemonicToOperandsCountMap } from '../../../common/constants'

interface State {
  end: boolean
  operandsLeft: number
  expectLabel: boolean
}

const asmLanguage = StreamLanguage.define<State>({
  token(stream, state) {
    if (state.end) {
      stream.skipToEnd()
      return 'comment'
    }

    if (stream.eatSpace() || stream.eat(/[,[\]:]/)) {
      return null
    }

    if (stream.eat(';')) {
      stream.skipToEnd()
      return 'lineComment'
    }

    if (stream.match(/^[a-zA-Z_]+(?=:)/)) {
      return 'labelName'
    }

    if (state.operandsLeft === 0) {
      const currentToken = (stream.match(/^\S+/) as RegExpMatchArray)[0]
      const upperCaseToken = currentToken.toUpperCase()
      if (upperCaseToken in Mnemonic) {
        const mnemonic = upperCaseToken as Mnemonic
        if (mnemonic === Mnemonic.END) {
          state.end = true
        }
        state.operandsLeft = MnemonicToOperandsCountMap[mnemonic]
        state.expectLabel = mnemonic.startsWith('J')
        return 'keyword'
      } else {
        stream.backUp(currentToken.length)
      }
    } else if (state.operandsLeft > 0) {
      if (stream.match(/^(?:[\da-fA-F]+|[a-dA-D][lL])\b/)) {
        state.operandsLeft -= 1
        return 'number'
      }

      if (stream.eat('"')) {
        stream.skipToEnd()
        const currentToken = stream.current()
        const lastQuoteIndex = currentToken.lastIndexOf('"')
        const lastCharIndex = currentToken.length - 1
        if (lastQuoteIndex !== 0 && lastQuoteIndex !== lastCharIndex) {
          stream.backUp(lastCharIndex - lastQuoteIndex)
        }
        state.operandsLeft -= 1
        return 'string'
      }

      if (state.expectLabel && stream.match(/^[a-zA-Z_]+/)) {
        state.operandsLeft -= 1
        state.expectLabel = false
        return 'labelName'
      }
    }

    stream.eatWhile(/\S/)
    return null
  },

  startState() {
    return {
      end: false,
      operandsLeft: 0,
      expectLabel: false
    }
  }
})

const LEADING_SPACE_REGEXP = /^ */
const LEADING_WHITESPACE_REGEXP = /^\s*/

export const asm = (): Extension => [
  new LanguageSupport(asmLanguage),
  indentUnit.of('\t'),
  indentService.of(({ state }, pos) => {
    const trimmedLine = state.doc.lineAt(pos).text.replace(LEADING_SPACE_REGEXP, '')
    const whitespaces = LEADING_WHITESPACE_REGEXP.exec(trimmedLine)?.[0].split('') ?? []
    const tabsCount = whitespaces.reduce((acc, char) => (char === '\t' ? acc + 1 : acc), 0)
    const spacesCount = whitespaces.length - tabsCount
    return tabsCount * state.tabSize + spacesCount
  })
]
