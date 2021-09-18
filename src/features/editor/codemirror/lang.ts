/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import { StreamLanguage } from '@codemirror/stream-parser'
import { LanguageSupport } from '@codemirror/language'
import { Mnemonic } from '../../../common/constants'

const MNEMONIC_REGEXP = new RegExp(
  `^(?:${Object.keys(Mnemonic)
    .map(mnemonic =>
      mnemonic
        .split('')
        .map(char => `[${[char.toLowerCase(), char].join('')}]`)
        .join('')
    )
    .join('|')})\\b`
)

export const AsmLanguage = StreamLanguage.define<{ lastMnemonic: string }>({
  token(stream, state) {
    if (stream.eatSpace() || stream.eat(/[,[\]:]/)) {
      return null
    }

    if (stream.peek() === ';') {
      stream.skipToEnd()
      return 'lineComment'
    }

    if (stream.match(/^[a-zA-Z_]+(?=:)/)) {
      return 'labelName'
    }

    if (stream.match(MNEMONIC_REGEXP)) {
      state.lastMnemonic = stream.current()
      return 'keyword'
    }

    if (stream.match(/^(?:[\da-fA-F]+|[a-dA-D][lL])\b/)) {
      return 'number'
    }

    if (stream.match(/^".*"/)) {
      return 'string'
    }

    if (stream.match(/^[a-zA-Z_]+/)) {
      if (/^[jJ]/.test(state.lastMnemonic)) {
        return 'labelName'
      }
      stream.backUp(stream.current().length)
    }

    stream.eatWhile(/\S+/)
    return null
  },
  startState() {
    return {
      lastMnemonic: ''
    }
  }
})

export const Asm = (): LanguageSupport => {
  return new LanguageSupport(AsmLanguage)
}
