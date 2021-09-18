/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import type { Extension } from '@codemirror/state'
import { StreamLanguage } from '@codemirror/stream-parser'
import { LanguageSupport, indentUnit, indentService } from '@codemirror/language'
import { Mnemonic, MnemonicToOperandsCountMap } from '../../../common/constants'

const MNEMONIC_REGEXP = new RegExp(
  `^(?:${Object.keys(Mnemonic)
    .map(mnemonic =>
      mnemonic
        .split('')
        .map(char => `[${char.toLowerCase()}${char}]`)
        .join('')
    )
    .join('|')})\\b`
)

const AsmLanguage = StreamLanguage.define<{ operandsLeft: number; expectLabel: boolean }>({
  token(stream, state) {
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
      if (stream.match(MNEMONIC_REGEXP)) {
        const mnemonic = stream.current().toUpperCase() as Mnemonic
        state.operandsLeft = MnemonicToOperandsCountMap[mnemonic]
        state.expectLabel = mnemonic.startsWith('J')
        return 'keyword'
      }
    } else if (state.operandsLeft > 0) {
      if (stream.match(/^(?:[\da-fA-F]+|[a-dA-D][lL])\b/)) {
        state.operandsLeft -= 1
        return 'number'
      }

      if (stream.match(/^".*(?:"|(?=[\r\n]))/)) {
        state.operandsLeft -= 1
        return 'string'
      }

      if (state.expectLabel && stream.match(/^[a-zA-Z_]+/)) {
        state.operandsLeft -= 1
        state.expectLabel = false
        return 'labelName'
      }
    }

    stream.eatWhile(/\S+/)
    return null
  },
  startState() {
    return {
      operandsLeft: 0,
      expectLabel: false
    }
  }
})

const LEADING_WHITESPACE_REGEXP = /^\s*/

export const Asm = (): Extension => [
  new LanguageSupport(AsmLanguage),
  indentUnit.of('\t'),
  indentService.of(({ state }, pos) => {
    const trimmedLine = state.doc.lineAt(pos).text.replace(/^ */, '')
    const whitespaces = LEADING_WHITESPACE_REGEXP.exec(trimmedLine)?.[0].split('') ?? []
    const tabsCount = whitespaces.filter(char => char === '\t').length
    return tabsCount * state.tabSize + whitespaces.length - tabsCount
  })
]
